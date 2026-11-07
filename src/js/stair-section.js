import { $, $$, clamp, esc, lerp, reduce, sc } from './core.js';
import { gsap, ScrollTrigger } from './gsap.js';
import { eventCard, initCardFx } from './ui.js';
import { initRegButtons } from './regbtn.js';
import { zoomIn } from './zoom.js';
import { L as TOTAL, gateArcs } from './highway-math.js';

const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function fallback(section, events, loggedIn) {
  section.classList.add('is-fallback');
  $('[data-stair-pin]', section).hidden = true;
  const fb = $('[data-stair-fallback]', section);
  fb.hidden = false;
  $('[data-fb-grid]', fb).innerHTML = events.map((e, i) => eventCard(e, i)).join('');
  initRegButtons(fb, loggedIn);
  initCardFx(fb);
  zoomIn($$('.ecard', fb), { from: 0.86, stagger: 0.06 });
}

export async function initStairSection(events, loggedIn) {
  const section = $('[data-stair]');
  if (!section) return;
  if (reduce || !events.length) { fallback(section, events, loggedIn); return; }

  const stage = $('[data-stair-stage]', section);
  const card = $('[data-card]', section);
  const dots = $('[data-dots]', section);
  const head = $('[data-stair-head]', section);
  const hint = $('[data-stair-hint]', section);
  const pad = n => String(n + 1).padStart(2, '0');
  const gateArc = gateArcs(events.length);

  dots.innerHTML = events.map((e, i) => `<li><button type="button" data-k="${i}" aria-label="Go to ${esc(e.title)}"><span>${pad(i)}</span></button></li>`).join('');
  const dotEls = $$('button', dots);

  initRegButtons(card, loggedIn, (id, on) => {
    const ev = events.find(x => x.id === id);
    if (ev) ev.isRegistered = on;
  });

  const paint = k => {
    const e = events[k];
    card.innerHTML = `<span class="stair__n" aria-hidden="true">${pad(k)}</span>
      <span class="chip">${esc(e.cat)}</span>
      <h3 class="stair__t">${esc(e.title)}</h3>
      <p class="stair__k">${esc(e.kind)}</p>
      <dl class="stair__m"><div><dt>When</dt><dd>${esc(e.when)}</dd></div><div><dt>Where</dt><dd>${esc(e.venue)}</dd></div><div><dt>Prize</dt><dd>${esc(e.prize)}</dd></div></dl>
      <div class="stair__act"><a class="btn btn--lime" href="/events/${esc(e.id)}">View event</a><button class="btn" type="button" data-reg="${esc(e.id)}" aria-pressed="${e.isRegistered}" ${e.spotsLeft === 0 && !e.isRegistered ? 'disabled' : ''}>${e.isRegistered ? 'Registered ✓' : 'Register'}</button></div>`;
  };

  let stairs = null, loading = false, active = -1, visible = false, st = null, target = 0, shownU = 0;

  const ensure = async () => {
    if (stairs || loading) return;
    loading = true;
    try {
      const mod = await import('./highway.js');
      stairs = mod.createHighway(stage, events.length);
      stairs.jump(target);
      addEventListener('resize', () => stairs.resize());
    } catch (err) {
      if (st) st.kill();
      fallback(section, events, loggedIn);
      ScrollTrigger.refresh();
    }
  };

  dots.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || !st) return;
    const p = clamp((gateArc[+b.dataset.k] + 0.4) / TOTAL);
    const y = st.start + p * (st.end - st.start);
    if (sc.lenis) sc.lenis.scrollTo(y, { duration: 1.8 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  });

  addEventListener('pointermove', e => {
    if (stairs) stairs.setPointer(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
  }, { passive: true });

  const frame = (time, deltaMs) => {
    if (!visible) return;
    const dt = Math.min(0.1, (deltaMs || 16) / 1000);
    let u, camS;
    if (stairs) ({ u, camS } = stairs.frame(dt));
    else { shownU = lerp(shownU, target, 1 - Math.exp(-dt * 7)); u = shownU; camS = u * TOTAL; }

    let k = -1, best = 1e9;
    gateArc.forEach((g, i) => { const d = Math.abs(camS - g); if (d < best) { best = d; k = i; } });
    if (best > 13) k = -1;
    if (k !== active) {
      active = k;
      if (k >= 0) paint(k);
      dotEls.forEach((b, i) => b.classList.toggle('is-on', i === k));
    }
    dotEls.forEach((b, i) => b.classList.toggle('is-done', camS > gateArc[i] + 3));

    if (k >= 0) {
      const dist = camS - gateArc[k];
      const inn = smooth(-11, -3.5, dist);
      const out = smooth(0.5, 4.8, dist);
      const op = inn * (1 - out);
      card.style.opacity = op.toFixed(3);
      card.style.transform = `scale(${(lerp(0.7, 1, inn) * lerp(1, 1.4, out)).toFixed(3)})`;
      card.style.pointerEvents = op > 0.7 ? 'auto' : 'none';
      card.style.visibility = op > 0.01 ? 'visible' : 'hidden';
    } else {
      card.style.visibility = 'hidden';
    }

    const t = smooth(0.0, 0.07, u);
    head.style.opacity = (1 - t).toFixed(3);
    head.style.transform = `scale(${(1 + t * 0.5).toFixed(3)})`;
    head.style.pointerEvents = t > 0.5 ? 'none' : 'auto';
    hint.style.opacity = String(1 - smooth(0, 0.03, u));
    stage.style.transform = `scale(${(1 + (1 - smooth(0, 0.05, u)) * 0.22).toFixed(3)})`;
    stage.style.opacity = String(1 - smooth(0.975, 1, u));
  };
  gsap.ticker.add(frame);

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + Math.round(innerHeight * (events.length * 0.95 + 1.4)),
      pin: $('[data-stair-pin]', section),
      pinSpacing: true,
      invalidateOnRefresh: true,
      onUpdate: self => { target = self.progress; if (stairs) stairs.setTarget(target); }
    });
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom+=900',
      end: 'bottom top',
      onEnter: ensure,
      onEnterBack: ensure,
      onRefresh: self => { if (self.isActive) ensure(); }
    });
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: self => { visible = self.isActive; },
      onRefresh: self => { visible = self.isActive; }
    });
  });
}
