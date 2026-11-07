import { boot } from '../js/boot.js';
import { $, $$, esc, reduce, toast } from '../js/core.js';
import { gsap } from '../js/gsap.js';
import { api, resetMe } from '../js/api.js';
import { profileHTML } from '../js/profile-view.js';
import { zoomIn } from '../js/zoom.js';

const SWATCHES = ['#C6FF3D', '#7DD3FC', '#FF7A59', '#F9A8D4', '#A78BFA', '#6EE7B7', '#FDE68A', '#FB923C'];
const EMOJIS = ['🌀', '🧠', '🤖', '🎨', '🔐', '📊', '⚡', '📱', '👁️', '✍️', '🔧', '✨', '🚀', '🎮', '🎧', '🦊'];
const THEMES = [['dark', 'Dark', 'Classic night'], ['light', 'Light', 'Paper white'], ['aurora', 'Aurora', 'Glowing gradient']];
const LAYOUTS = [['cards', 'Cards', 'Project grid'], ['timeline', 'Timeline', 'Vertical story'], ['minimal', 'Minimal', 'Clean list']];
const COVERS = [['mobius', 'Möbius', 'Our logo shape'], ['grid', 'Grid', 'Blueprint'], ['dots', 'Dots', 'Halftone'], ['waves', 'Waves', 'Flowing lines']];

const params = new URLSearchParams(location.search);

boot({
  auth: true,
  setup: async () => {
    const data = await api.get('/me/profile');
    const st = { name: data.user.name, college: data.user.college, ...data.profile };
    st.links = st.links.map(l => ({ ...l }));
    st.projects = st.projects.map(p => ({ ...p, tags: [...(p.tags || [])] }));
    st.skills = [...st.skills];
    st.sections = { ...st.sections };
    let dirty = false;
    let ctx = data;

    const hello = $('[data-hello]');
    hello.innerHTML = `Hi, <em>${esc(data.user.name.split(' ')[0])}</em>`;

    const panels = { overview: $('[data-panel="overview"]'), profile: $('[data-panel="profile"]'), account: $('[data-panel="account"]') };
    const tabBtns = $$('[data-tab]');
    const showTab = (name, animate = true) => {
      Object.entries(panels).forEach(([k, el]) => { el.hidden = k !== name; });
      tabBtns.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
      history.replaceState(null, '', `${location.pathname}${location.search}#${name}`);
      if (animate && !reduce) gsap.from(panels[name].children, { opacity: 0, scale: 0.94, y: 24, duration: 0.8, ease: 'expo.out', stagger: 0.08 });
    };
    tabBtns.forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));

    function renderOverview() {
      const c = 2 * Math.PI * 52;
      const regs = ctx.registrations;
      panels.overview.innerHTML = `
        ${params.get('welcome') ? `<div class="welcome"><h2>Welcome to TECHFEST '27, ${esc(data.user.name.split(' ')[0])}.</h2><p>Your account is ready${regs.length ? ` and you are registered for ${regs.length} event${regs.length > 1 ? 's' : ''}` : ''}. Next, make your public profile yours.</p></div>` : ''}
        <div class="ov">
          <div class="panel ov__card"><h2>Profile strength</h2>
            <div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-ring/></svg><b>${ctx.completeness}%</b></div>
            <p class="field__hint" style="text-align:center;margin-bottom:14px">${ctx.completeness >= 100 ? 'Your profile is complete.' : 'Add a headline, bio, 3 skills, a project, a link and an emoji for 100%.'}</p>
            <div style="display:grid;gap:8px"><button class="btn btn--lime" type="button" data-goto="profile">Customize profile</button><a class="btn" href="/u/${esc(st.handle)}">View public profile</a></div>
          </div>
          <div class="panel ov__card" style="grid-column:span 2"><h2>My registrations (${regs.length})</h2>
            ${regs.length ? `<div class="reglist">${regs.map(e => `<div class="regrow"><a href="/events/${esc(e.id)}">${esc(e.title)}</a><button type="button" data-cancel="${esc(e.id)}">Cancel</button><small>${esc(e.cat)} · ${esc(e.when)} · ${esc(e.venue)}</small></div>`).join('')}</div>` : '<p class="lede">You have not registered for any events yet.</p>'}
            <p style="margin-top:16px"><a class="link" href="/events.html">Browse all events →</a> · <a class="link" href="/schedule.html">My schedule →</a></p>
          </div>
        </div>
        <div class="panel ov__card"><h2>Badges (${ctx.badges.length})</h2>
          <div class="bdgs">${ctx.badges.length ? ctx.badges.map(b => `<div class="bdg"><i aria-hidden="true">★</i><div><b>${esc(b.label)}</b><small>${esc(b.desc)}</small></div></div>`).join('') : '<p class="lede">Register for events and complete your profile to earn badges.</p>'}</div>
        </div>`;
      requestAnimationFrame(() => { const r = $('[data-ring]', panels.overview); if (r) r.style.strokeDashoffset = String(c * (1 - ctx.completeness / 100)); });
    }

    panels.overview.addEventListener('click', async e => {
      const g = e.target.closest('[data-goto]');
      if (g) { showTab(g.dataset.goto); return; }
      const cb = e.target.closest('[data-cancel]');
      if (cb) {
        cb.disabled = true;
        try {
          await api.del(`/registrations/${cb.dataset.cancel}`);
          ctx = await api.get('/me/profile');
          renderOverview();
          renderPreview();
          toast('Registration removed.');
        } catch (err) { toast(err.message); cb.disabled = false; }
      }
    });

    const previewPerson = () => ({
      ...st,
      initials: (st.name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')) || '?',
      events: ctx.registrations.map(e => ({ id: e.id, title: e.title, cat: e.cat, when: e.when })),
      badges: ctx.badges,
      joined: ctx.user.joined,
      links: st.links.filter(l => l.label && /^https?:\/\//i.test(l.url)),
      projects: st.projects.filter(p => p.title)
    });

    let prevBox;
    let raf = 0;
    const renderPreview = () => {
      if (!prevBox) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { prevBox.innerHTML = profileHTML(previewPerson()); });
    };

    const markDirty = () => {
      dirty = true;
      $('.savebar', panels.profile).classList.add('is-dirty');
      $('[data-savemsg]').textContent = 'Unsaved changes';
      renderPreview();
    };

    const optBtns = (key, list) => list.map(([v, l, s]) => `<button class="opt" type="button" data-opt="${key}" data-v="${v}" aria-pressed="${st[key] === v}">${l}<small>${s}</small></button>`).join('');

    function repLinks() {
      $('[data-links]').innerHTML = st.links.map((l, i) => `<div class="rep__item"><div class="rep__row"><input data-li="${i}" data-k="label" value="${esc(l.label)}" placeholder="Label, e.g. GitHub" maxlength="24" aria-label="Link label"><input data-li="${i}" data-k="url" value="${esc(l.url)}" placeholder="https://" maxlength="200" aria-label="Link URL"><button class="rep__x" type="button" data-rm-link="${i}">Remove</button></div></div>`).join('') || '<p class="field__hint">No links yet.</p>';
      $('[data-add-link]').disabled = st.links.length >= 6;
    }
    function repProjects() {
      $('[data-projects]').innerHTML = st.projects.map((p, i) => `<div class="rep__item">
        <div class="rep__row" style="grid-template-columns:1fr auto"><input data-pi="${i}" data-k="title" value="${esc(p.title)}" placeholder="Project title" maxlength="60" aria-label="Project title"><button class="rep__x" type="button" data-rm-proj="${i}">Remove</button></div>
        <textarea data-pi="${i}" data-k="desc" placeholder="What is it?" maxlength="240" aria-label="Project description">${esc(p.desc)}</textarea>
        <input data-pi="${i}" data-k="url" value="${esc(p.url)}" placeholder="Link (https://…)" maxlength="200" aria-label="Project link">
        <input data-pi="${i}" data-k="tags" value="${esc((p.tags || []).join(', '))}" placeholder="Tags, comma separated (max 4)" aria-label="Project tags"></div>`).join('') || '<p class="field__hint">No projects yet. Showcase something you built.</p>';
      $('[data-add-proj]').disabled = st.projects.length >= 6;
    }
    function repSkills() {
      const box = $('[data-skills]');
      box.innerHTML = st.skills.map((s, i) => `<span>${esc(s)}<button type="button" data-rm-skill="${i}" aria-label="Remove ${esc(s)}">×</button></span>`).join('') + '<input data-skill-in placeholder="Type a skill and press Enter" maxlength="24" aria-label="Add a skill">';
    }

    function renderProfile() {
      panels.profile.innerHTML = `
        <div class="ed">
          <form class="ed__form" data-ed novalidate>
            <div class="panel ed__group"><h2>Basics</h2>
              <div class="row2"><div class="field"><label for="p-name">Display name</label><input id="p-name" data-f="name" value="${esc(st.name)}" maxlength="60"><p class="field__err" data-err="name"></p></div>
              <div class="field"><label for="p-college">College</label><input id="p-college" data-f="college" value="${esc(st.college)}" maxlength="80"><p class="field__err" data-err="college"></p></div></div>
              <div class="field"><label for="p-handle">Profile link</label><div class="handlebox"><span>/u/</span><input id="p-handle" data-f="handle" value="${esc(st.handle)}" maxlength="20" autocapitalize="none" spellcheck="false"></div><p class="field__err" data-err="handle"></p></div>
              <div class="field"><label for="p-headline">Headline</label><input id="p-headline" data-f="headline" value="${esc(st.headline)}" maxlength="90" placeholder="One line about you"><p class="field__hint"><span data-count="headline">${st.headline.length}</span>/90</p></div>
              <div class="field"><label for="p-bio">Bio</label><textarea id="p-bio" data-f="bio" maxlength="500" placeholder="A few sentences: what you build, what you are here for.">${esc(st.bio)}</textarea><p class="field__hint"><span data-count="bio">${st.bio.length}</span>/500</p></div>
            </div>
            <div class="panel ed__group"><h2>Look and feel</h2>
              <div class="field"><span class="label">Accent colour</span><div class="swatches">${SWATCHES.map(c => `<button class="sw" type="button" style="--c:${c}" data-accent="${c}" aria-label="Use ${c}" aria-pressed="${st.accent.toLowerCase() === c.toLowerCase()}"></button>`).join('')}<input type="color" data-f="accent" value="${esc(st.accent)}" aria-label="Custom accent colour"></div></div>
              <div class="field"><span class="label">Theme</span><div class="opts">${optBtns('theme', THEMES)}</div></div>
              <div class="field"><span class="label">Layout</span><div class="opts">${optBtns('layout', LAYOUTS)}</div></div>
              <div class="field"><span class="label">Cover art</span><div class="opts">${optBtns('cover', COVERS)}</div></div>
              <div class="field"><span class="label">Avatar emoji <span class="field__hint">(or use your initials)</span></span><div class="emojis"><button class="emo" type="button" data-emoji="" aria-pressed="${st.emoji === ''}" aria-label="Use initials" style="font-size:14px;font-weight:700">Aa</button>${EMOJIS.map(m => `<button class="emo" type="button" data-emoji="${m}" aria-pressed="${st.emoji === m}" aria-label="Emoji ${m}">${m}</button>`).join('')}</div></div>
            </div>
            <div class="panel ed__group"><h2>Skills</h2><div class="taginput" data-skills></div><p class="field__hint">Up to 12. Press Enter or comma to add.</p></div>
            <div class="panel ed__group"><h2>Links</h2><div class="rep" data-links></div><button class="btn btn--sm" type="button" data-add-link style="justify-self:start">+ Add link</button></div>
            <div class="panel ed__group"><h2>Projects</h2><div class="rep" data-projects></div><button class="btn btn--sm" type="button" data-add-proj style="justify-self:start">+ Add project</button></div>
            <div class="panel ed__group"><h2>What to show</h2><div class="toggles">
              ${[['events', 'Registered events'], ['badges', 'Badges'], ['projects', 'Projects'], ['links', 'Links']].map(([k, l]) => `<label class="switch"><input type="checkbox" data-sec="${k}" ${st.sections[k] ? 'checked' : ''}> ${l}</label>`).join('')}
              <label class="switch"><input type="checkbox" data-f="isPublic" ${st.isPublic ? 'checked' : ''}> Public profile (listed on the People page)</label></div></div>
            <div class="savebar"><span><i class="dot"></i><span data-savemsg>All changes saved</span></span><span style="display:flex;gap:10px"><a class="btn btn--sm" href="/u/${esc(st.handle)}" data-view>View public page</a><button class="btn btn--lime btn--sm" type="submit">Save profile</button></span></div>
          </form>
          <aside class="ed__preview"><p class="eyebrow">Live preview</p><div class="ed__prevbox" data-prev></div></aside>
        </div>`;
      prevBox = $('[data-prev]', panels.profile);
      repSkills(); repLinks(); repProjects();
      prevBox.innerHTML = profileHTML(previewPerson());
      bindEditor();
    }

    function bindEditor() {
      const form = $('[data-ed]', panels.profile);
      form.addEventListener('input', e => {
        const t = e.target;
        if (t.dataset.f && t.type !== 'checkbox') {
          st[t.dataset.f] = t.value;
          const c = $(`[data-count="${t.dataset.f}"]`, form);
          if (c) c.textContent = t.value.length;
          if (t.dataset.f === 'accent') $$('.sw', form).forEach(s => s.setAttribute('aria-pressed', String(s.dataset.accent.toLowerCase() === t.value.toLowerCase())));
          markDirty();
        } else if (t.dataset.li !== undefined) { st.links[+t.dataset.li][t.dataset.k] = t.value; markDirty(); }
        else if (t.dataset.pi !== undefined) {
          const p = st.projects[+t.dataset.pi];
          p[t.dataset.k] = t.dataset.k === 'tags' ? t.value.split(',').map(x => x.trim()).filter(Boolean).slice(0, 4) : t.value;
          markDirty();
        }
      });
      form.addEventListener('change', e => {
        const t = e.target;
        if (t.dataset.sec) { st.sections[t.dataset.sec] = t.checked; markDirty(); }
        if (t.dataset.f === 'isPublic') { st.isPublic = t.checked; markDirty(); }
      });
      form.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.accent) { st.accent = b.dataset.accent; $('[type=color]', form).value = st.accent; $$('.sw', form).forEach(s => s.setAttribute('aria-pressed', String(s === b))); markDirty(); }
        else if (b.dataset.opt) { st[b.dataset.opt] = b.dataset.v; $$(`[data-opt="${b.dataset.opt}"]`, form).forEach(s => s.setAttribute('aria-pressed', String(s === b))); markDirty(); }
        else if (b.dataset.emoji !== undefined) { st.emoji = b.dataset.emoji; $$('.emo', form).forEach(s => s.setAttribute('aria-pressed', String(s === b))); markDirty(); }
        else if (b.dataset.rmSkill !== undefined) { st.skills.splice(+b.dataset.rmSkill, 1); repSkills(); markDirty(); }
        else if (b.dataset.rmLink !== undefined) { st.links.splice(+b.dataset.rmLink, 1); repLinks(); markDirty(); }
        else if (b.dataset.rmProj !== undefined) { st.projects.splice(+b.dataset.rmProj, 1); repProjects(); markDirty(); }
        else if (b.hasAttribute('data-add-link')) { st.links.push({ label: '', url: '' }); repLinks(); markDirty(); }
        else if (b.hasAttribute('data-add-proj')) { st.projects.push({ title: '', desc: '', url: '', tags: [] }); repProjects(); markDirty(); }
      });
      form.addEventListener('keydown', e => {
        const t = e.target;
        if (!t.matches('[data-skill-in]')) return;
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const v = t.value.trim().replace(/,$/, '');
          if (v && st.skills.length < 12 && !st.skills.some(s => s.toLowerCase() === v.toLowerCase())) { st.skills.push(v.slice(0, 24)); repSkills(); $('[data-skill-in]', form).focus(); markDirty(); }
        } else if (e.key === 'Backspace' && !t.value && st.skills.length) { st.skills.pop(); repSkills(); $('[data-skill-in]', form).focus(); markDirty(); }
      });
      form.addEventListener('submit', async e => {
        e.preventDefault();
        $$('.field__err', form).forEach(p => { p.textContent = ''; });
        $$('[aria-invalid]', form).forEach(i => i.removeAttribute('aria-invalid'));
        const msg = $('[data-savemsg]');
        msg.textContent = 'Saving…';
        try {
          ctx = await api.put('/me/profile', { ...st, links: st.links.filter(l => l.label && l.url), projects: st.projects.filter(p => p.title) });
          Object.assign(st, { name: ctx.user.name, college: ctx.user.college, ...ctx.profile });
          st.links = st.links.map(l => ({ ...l }));
          st.projects = st.projects.map(p => ({ ...p, tags: [...(p.tags || [])] }));
          st.skills = [...st.skills];
          dirty = false;
          $('.savebar', form).classList.remove('is-dirty');
          msg.textContent = 'All changes saved';
          $('[data-view]', form).href = `/u/${st.handle}`;
          resetMe();
          renderOverview();
          renderPreview();
          toast('Profile saved.');
        } catch (err) {
          msg.textContent = err.message;
          Object.entries(err.fields || {}).forEach(([k, v]) => {
            const el = $(`[data-err="${k}"]`, form);
            if (el) el.textContent = v;
            const inp = $(`[data-f="${k}"]`, form);
            if (inp) inp.setAttribute('aria-invalid', 'true');
          });
          toast(err.message);
        }
      });
    }

    function renderAccount() {
      panels.account.innerHTML = `
        <div class="panel formcard"><h2>Account</h2>
          <dl class="facts"><div><dt>Email</dt><dd>${esc(ctx.user.email)}</dd></div><div><dt>Name</dt><dd>${esc(ctx.user.name)}</dd></div><div><dt>College</dt><dd>${esc(ctx.user.college)}</dd></div></dl>
          <div><button class="btn" type="button" data-logout-btn>Log out</button></div>
        </div>
        <form class="panel formcard" data-pw novalidate><h2>Change password</h2>
          <div class="field"><label for="pw-cur">Current password</label><input id="pw-cur" name="current" type="password" autocomplete="current-password"><p class="field__err" data-err="current"></p></div>
          <div class="field"><label for="pw-new">New password</label><input id="pw-new" name="next" type="password" autocomplete="new-password"><p class="field__err" data-err="next"></p></div>
          <button class="btn btn--lime" type="submit" style="justify-self:start">Update password</button>
          <p class="status" data-pwstatus role="status" aria-live="polite"></p>
        </form>`;
      $('[data-logout-btn]', panels.account).addEventListener('click', async () => { await api.post('/auth/logout'); resetMe(); location.href = '/'; });
      const f = $('[data-pw]', panels.account), s = $('[data-pwstatus]', panels.account);
      f.addEventListener('submit', async e => {
        e.preventDefault();
        $$('.field__err', f).forEach(p => { p.textContent = ''; });
        s.className = 'status';
        try {
          await api.post('/me/password', { current: f.elements.current.value, next: f.elements.next.value });
          f.reset();
          s.textContent = 'Password updated.';
          s.classList.add('is-ok');
        } catch (err) {
          s.textContent = err.message;
          s.classList.add('is-bad');
          Object.entries(err.fields || {}).forEach(([k, v]) => { const el = $(`[data-err="${k}"]`, f); if (el) el.textContent = v; });
        }
      });
    }

    renderOverview();
    renderProfile();
    renderAccount();
    const start = location.hash.slice(1);
    showTab(['overview', 'profile', 'account'].includes(start) ? start : 'overview', false);
    zoomIn($$('.ov__card, .welcome'), { from: 0.9, stagger: 0.1 });
    addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  }
});
