export const root = document.documentElement;
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!reduce) root.classList.add('js');
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const sc = { lenis: null };

let toastTimer;
export function toast(msg) {
  const t = $('[data-toast]');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 3200);
}

export function scrollToEl(el) {
  const top = el.getBoundingClientRect().top + scrollY - 84;
  if (sc.lenis) sc.lenis.scrollTo(top, { duration: 1.2 });
  else window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
}
