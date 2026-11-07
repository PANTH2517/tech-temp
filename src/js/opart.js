import { $$, clamp, reduce, root, sc } from './core.js';
import { gsap } from './gsap.js';

export function initScrollVar() {
  if (innerWidth <= 860) return;
  let queued = false;
  const set = () => {
    queued = false;
    root.style.setProperty('--scr', (scrollY * 0.35).toFixed(1));
  };
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(set); }
  }, { passive: true });
  set();
}

export function initBands() {
  const bands = $$('[data-band]');
  if (!bands.length) return;
  const phrase = 'The rules contradict themselves';
  const parts = ['Paradox', phrase, 'Everything is its opposite', 'Up is down', 'This sentence is false'];
  bands.forEach((band, i) => {
    const track = band.querySelector('.band__track');
    const html = parts.map(p => `<span class="band__item">${p}</span>`).join('');
    track.innerHTML = html + html + html;
    band.dataset.dir = i % 2 ? '1' : '-1';
    band.dataset.x = '0';
  });
  if (reduce) return;
  addEventListener('resize', () => bands.forEach(b => { delete b.dataset.w; }));
  gsap.ticker.add(() => {
    const v = sc.lenis ? sc.lenis.velocity : 0;
    bands.forEach(b => {
      const t = b.querySelector('.band__track');
      const w = +b.dataset.w || (b.dataset.w = String(t.scrollWidth / 3 || 1), +b.dataset.w);
      let x = +b.dataset.x + (+b.dataset.dir) * (1.1 + Math.min(Math.abs(v) * 0.6, 22));
      x = ((x % w) + w) % w;
      b.dataset.x = String(x);
      t.style.transform = `translate3d(${-x}px,0,0)`;
    });
  });
}

export const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
