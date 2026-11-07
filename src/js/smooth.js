import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';
import { reduce, sc } from './core.js';

export function initSmooth() {
  if (reduce) return;
  const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  sc.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
