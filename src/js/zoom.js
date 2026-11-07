import { $, $$, reduce } from './core.js';
import { gsap, ScrollTrigger } from './gsap.js';

export function zoomIn(els, { from = 0.88, y = 28, stagger = 0.08, start = 'top 92%' } = {}) {
  const list = typeof els === 'string' ? $$(els) : [...els];
  if (reduce || !list.length) return;
  gsap.set(list, { opacity: 0, scale: from, y });
  const io = new IntersectionObserver(entries => {
    const hit = entries.filter(x => x.isIntersecting || x.boundingClientRect.top < 0).map(x => x.target);
    if (!hit.length) return;
    hit.forEach(t => io.unobserve(t));
    gsap.to(hit, { opacity: 1, scale: 1, y: 0, duration: 1.05, ease: 'expo.out', stagger, overwrite: true });
  }, { rootMargin: '0px 0px -8% 0px' });
  list.forEach(el => io.observe(el));
}

export function zoomHead(el) {
  if (reduce || !el) return;
  gsap.fromTo(el, { scale: 1.18, opacity: 0, transformOrigin: '50% 60%' }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out' });
}

export function countUp(el, to, { duration = 1.6, suffix = '' } = {}) {
  if (reduce) { el.textContent = to.toLocaleString('en-IN') + suffix; return; }
  const o = { v: 0 };
  gsap.to(o, { v: to, duration, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-IN') + suffix; } });
}

export function portalZoom(section) {
  if (!section) return;
  const word = $('.portal__word', section);
  const o = $('[data-o]', section);
  const bg = $('.portal__bg', section);
  const pin = $('.portal__pin', section);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const origin = () => {
      gsap.set(word, { scale: 1, clearProps: 'transform' });
      const wr = word.getBoundingClientRect();
      const or = o.getBoundingClientRect();
      return `${or.left + or.width / 2 - wr.left}px ${or.top + or.height / 2 - wr.top}px`;
    };
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top top', end: '+=240%', pin, scrub: true, invalidateOnRefresh: true }
    });
    tl.fromTo(word, { scale: 1, transformOrigin: origin }, { scale: 34, transformOrigin: origin, ease: 'power3.in', duration: 1 }, 0)
      .fromTo(bg, { scale: 0.55, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 1 }, 0.1)
      .to(word, { opacity: 0, duration: 0.08 }, 0.92);
  });
}

export function focusGallery(section) {
  if (!section) return;
  const track = $('.gal__track', section);
  const cards = $$('.gal__card', section);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + dist(), pin: $('.gal__pin', section), scrub: true, invalidateOnRefresh: true }
    });
    cards.forEach(c => {
      gsap.fromTo(c, { scale: 0.74, opacity: 0.45 }, {
        scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 92%', end: 'left 52%', scrub: true }
      });
      gsap.to(c, {
        scale: 0.74, opacity: 0.45, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'right 48%', end: 'right 8%', scrub: true }
      });
    });
  });
  mm.add('(max-width: 860px) and (prefers-reduced-motion: no-preference)', () => {
    zoomIn(cards, { from: 0.86, stagger: 0.05 });
  });
}

export function heroDepth(hero) {
  if (!hero) return;
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to($('.hero__in', hero), {
      scale: 0.86, opacity: 0, y: -40, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: true }
    });
  });
}
