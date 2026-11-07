import { esc, fine, reduce } from './core.js';
import { gsap } from './gsap.js';

export const avatar = (p, cls = '') =>
  `<span class="av ${cls}" style="--av:${esc(p.accent || '#C6FF3D')}" aria-hidden="true">${p.emoji ? esc(p.emoji) : esc(p.initials || '')}</span>`;

export function eventCard(e, i = 0, level = 3) {
  const pct = Math.min(100, Math.round((e.registered / e.capacity) * 100));
  const low = e.spotsLeft > 0 && e.spotsLeft <= 15;
  const twin = e.twin || e.title;
  return `<article class="ecard" data-id="${esc(e.id)}" data-flip-id="${esc(e.id)}">
    <div class="ecard__tilt"><div class="ecard__flip">
      <div class="ecard__face ecard__front">
        <a class="ecard__main" href="/events/${esc(e.id)}">
          <span class="ecard__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="ecard__top"><span class="chip">${esc(e.cat)}</span><span class="ecard__prize">${esc(e.prize)}</span></span>
          <h${level} class="ecard__t">${esc(e.title)}</h${level}>
          <p class="ecard__k">${esc(e.kind)}</p>
          <dl class="ecard__m"><div><dt>When</dt><dd>${esc(e.when)}</dd></div><div><dt>Where</dt><dd>${esc(e.venue)}</dd></div><div><dt>Team</dt><dd>${esc(e.team)}</dd></div></dl>
          <span class="meter" role="img" aria-label="${pct}% full"><i style="width:${pct}%"></i></span>
          <span class="ecard__spots${low ? ' is-low' : ''}">${e.spotsLeft === 0 ? 'Full' : `${e.spotsLeft} spots left`}</span>
        </a>
        <div class="ecard__bar">
          <button class="ecard__btn${e.isRegistered ? ' is-on' : ''}" type="button" data-reg="${esc(e.id)}" aria-pressed="${e.isRegistered}" ${e.spotsLeft === 0 && !e.isRegistered ? 'disabled' : ''}>${e.isRegistered ? 'Registered ✓' : 'Register'}</button>
          <button class="ecard__turn" type="button" data-flip aria-pressed="false" aria-label="Show the false twin of ${esc(e.title)}"><span aria-hidden="true">⟲</span> Twin</button>
        </div>
      </div>
      <div class="ecard__face ecard__back" inert>
        <div class="ecard__bk">
          <p class="ecard__ghost">Before you looked, it was also</p>
          <p class="ecard__twin">${esc(twin)}</p>
          <p class="ecard__same">Same event, other side. Same venue, same prize, same rules, opposite name.</p>
        </div>
        <div class="ecard__bar">
          <a class="btn btn--sm ecard__open" href="/events/${esc(e.id)}">Open event</a>
          <button class="ecard__turn" type="button" data-flip aria-pressed="true" aria-label="Back to ${esc(e.title)}"><span aria-hidden="true">⟲</span> Back</button>
        </div>
      </div>
    </div></div>
  </article>`;
}

export function initCardFx(root) {
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-flip]');
    if (!b) return;
    const card = b.closest('.ecard');
    const on = !card.classList.contains('is-flipped');
    card.classList.toggle('is-flipped', on);
    card.querySelector('.ecard__front').inert = on;
    card.querySelector('.ecard__back').inert = !on;
    if (!reduce) gsap.to(card.querySelector('.ecard__tilt'), { rotateX: 0, rotateY: 0, duration: 0.5, overwrite: 'auto' });
    const target = card.querySelector(on ? '.ecard__back [data-flip]' : '.ecard__front [data-flip]');
    setTimeout(() => target && target.focus({ preventScroll: true }), 450);
  });
  if (!fine || reduce) return;
  root.addEventListener('pointermove', e => {
    const card = e.target.closest('.ecard');
    if (!card || card.classList.contains('is-flipped')) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card.querySelector('.ecard__tilt'), { rotateY: px * 10, rotateX: -py * 9, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
  });
  root.addEventListener('pointerout', e => {
    const card = e.target.closest('.ecard');
    if (card && !card.contains(e.relatedTarget)) gsap.to(card.querySelector('.ecard__tilt'), { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
  });
}

export const fmtDate = s => {
  const d = new Date(String(s).replace(' ', 'T') + 'Z');
  return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};
