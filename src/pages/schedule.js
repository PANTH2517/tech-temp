import { boot } from '../js/boot.js';
import { $, $$, clamp, esc, lerp, reduce, sc } from '../js/core.js';
import { gsap, ScrollTrigger } from '../js/gsap.js';
import { api } from '../js/api.js';

const pad = n => String(n).padStart(2, '0');

boot({
  setup: async user => {
    const { days } = await api.get('/schedule');
    if (user.user) { $('[data-mine-wrap]').hidden = false; $('[data-tt-mine-wrap]').hidden = false; }

    const tabs = $('[data-tabs]');
    const panel = $('[data-tl]');
    const mineBox = $('[data-mine]');
    let current = 0;
    tabs.insertAdjacentHTML('afterbegin', days.map((d, i) => `<button class="tab" type="button" role="tab" id="tab-${i}" aria-selected="${i === 0}" aria-controls="tl" tabindex="${i === 0 ? 0 : -1}" data-i="${i}"><b>${esc(d.label)}</b><span>${esc(d.date)}</span></button>`).join(''));
    panel.id = 'tl';

    const show = animate => {
      const d = days[current];
      const list = mineBox.checked ? d.slots.filter(s => s.mine) : d.slots;
      panel.setAttribute('aria-labelledby', `tab-${current}`);
      panel.innerHTML = `<div class="tl__head"><h2>${esc(d.label)} · ${esc(d.date)}</h2><p>${esc(d.theme)}</p></div>` +
        (list.length ? list.map(s => {
          const inner = `<span class="slot__t">${esc(s.time)}</span><span class="slot__w">${esc(s.title)}${s.mine ? '<span class="badge">Yours</span>' : ''}${s.eventId ? '<small>Event details →</small>' : ''}</span><span class="slot__v">${esc(s.venue)}</span>`;
          return s.eventId ? `<a class="slot${s.mine ? ' is-mine' : ''}" href="/events/${esc(s.eventId)}">${inner}</a>` : `<div class="slot">${inner}</div>`;
        }).join('') : '<p class="empty" style="margin:20px">You have no registered events on this day yet.</p>');
      if (animate && !reduce) gsap.from($$('.slot', panel), { opacity: 0, scale: 0.94, y: 14, duration: 0.6, ease: 'expo.out', stagger: 0.06 });
    };
    const select = (i, focus) => {
      current = i;
      $$('.tab', tabs).forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
      if (focus) $$('.tab', tabs)[i].focus();
      show(true);
    };
    tabs.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) select(+b.dataset.i, false); });
    tabs.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); select((current + 1) % days.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); select((current - 1 + days.length) % days.length, true); }
    });
    mineBox.addEventListener('change', () => show(true));
    show(false);

    const section = $('[data-tt]');
    if (reduce) { section.hidden = true; return; }

    const stage = $('[data-stage]'), ringsHost = $('[data-rings]'), daysHost = $('[data-tt-days]');
    const mineTT = $('[data-tt-mine]');
    let items = [];
    let cards = [];
    let dayStart = [];

    const build = () => {
      items = [];
      dayStart = [];
      days.forEach((d, di) => {
        const slots = mineTT.checked ? d.slots.filter(s => s.mine) : d.slots;
        if (mineTT.checked && !slots.length) return;
        dayStart[di] = items.length;
        items.push({ type: 'day', d, di });
        slots.forEach(s => items.push({ type: 'slot', s, d, di }));
      });
      stage.innerHTML = items.map((it, i) => {
        if (it.type === 'day') return `<article class="tt__card tt__card--day" data-i="${i}"><p class="tt__dn">${esc(it.d.label)}</p><p class="tt__dd">${esc(it.d.date)} · ${esc(it.d.theme)}</p></article>`;
        const s = it.s;
        const inner = `<span class="tt__time">${esc(s.time)}</span><span class="tt__what">${esc(s.title)}${s.mine ? '<span class="badge">Yours</span>' : ''}</span><span class="tt__where">${esc(s.venue)}${s.eventId ? ' · Event details →' : ''}</span>`;
        return s.eventId ? `<a class="tt__card" data-i="${i}" href="/events/${esc(s.eventId)}">${inner}</a>` : `<div class="tt__card" data-i="${i}">${inner}</div>`;
      }).join('');
      cards = $$('.tt__card', stage);
      $('[data-total]').textContent = pad(items.length);
      daysHost.innerHTML = days.map((d, i) => `<button type="button" data-day="${i}" ${dayStart[i] === undefined ? 'disabled' : ''}><b>${esc(d.label)}</b><span>${esc(d.date)}</span></button>`).join('');
    };

    const RN = 10;
    ringsHost.innerHTML = Array.from({ length: RN }, () => '<i></i>').join('');
    const rings = $$('i', ringsHost);

    build();

    let target = 0, cur = 0, visible = false, st = null;
    const render = (time, dtMs) => {
      if (!visible) return;
      const dt = Math.min(0.1, (dtMs || 16) / 1000);
      cur = lerp(cur, target, 1 - Math.exp(-dt * 6));
      cards.forEach((c, i) => {
        const d = i - cur;
        let x = 0, y = 0, z = 0, ry = 0, op = 1;
        if (d >= 0) {
          z = -d * 520;
          x = (i % 2 ? 1 : -1) * Math.min(d, 6) * 90;
          y = Math.min(d, 6) * 30;
          ry = (i % 2 ? -1 : 1) * Math.min(d, 6) * 7;
          op = clamp(1.15 - d * 0.3);
        } else {
          z = -d * 1250;
          x = (i % 2 ? -1 : 1) * -d * 140;
          op = clamp(1 + d * 2.1);
        }
        c.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px),calc(-50% + ${y.toFixed(1)}px),${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
        c.style.opacity = op.toFixed(3);
        c.style.visibility = op > 0.01 ? 'visible' : 'hidden';
        c.style.pointerEvents = Math.abs(d) < 0.4 ? 'auto' : 'none';
        c.style.zIndex = String(1000 - Math.round(Math.abs(d) * 10));
        c.tabIndex = Math.abs(d) < 0.5 ? 0 : -1;
      });
      rings.forEach((r, k) => {
        const f = (((k / RN) + cur * 0.045) % 1 + 1) % 1;
        const s = 0.06 + f * f * 5.5;
        r.style.transform = `translate(-50%,-50%) scale(${s.toFixed(3)}) rotate(${(f * 40 + cur * 3).toFixed(2)}deg)`;
        r.style.opacity = (Math.sin(Math.PI * f) * 0.55).toFixed(3);
      });
      const idx = clamp(Math.round(cur), 0, items.length - 1);
      $('[data-now]').textContent = pad(idx + 1);
      const di = items[idx] ? items[idx].di : 0;
      $$('button', daysHost).forEach(b => b.classList.toggle('is-on', +b.dataset.day === di));
      $('[data-tt-bar]').style.width = (items.length > 1 ? (cur / (items.length - 1)) * 100 : 0) + '%';
    };
    gsap.ticker.add(render);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      section.classList.add('is-on');
      const len = () => Math.round(innerHeight * Math.max(2, (items.length - 1) * 0.55 + 0.6));
      st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + len(),
        pin: $('[data-tt-pin]'),
        invalidateOnRefresh: true,
        onUpdate: self => { target = self.progress * (items.length - 1); },
        onToggle: self => { visible = self.isActive; },
        onRefresh: self => { visible = self.isActive; }
      });
      ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onToggle: self => { visible = self.isActive || visible; } });
      return () => { section.classList.remove('is-on'); st = null; };
    });

    daysHost.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b || !st) return;
      const idx = dayStart[+b.dataset.day];
      const y = st.start + (idx / Math.max(1, items.length - 1)) * (st.end - st.start);
      if (sc.lenis) sc.lenis.scrollTo(y, { duration: 1.6 }); else window.scrollTo({ top: y, behavior: 'smooth' });
    });
    mineTT.addEventListener('change', () => { build(); target = 0; cur = 0; ScrollTrigger.refresh(); });
  }
});
