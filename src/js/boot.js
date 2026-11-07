import '../styles/base.css';
import '../styles/home.css';
import '../styles/pages.css';
import '../styles/profile.css';
import '../styles/opart.css';
import { ScrollTrigger } from './gsap.js';
import { initScrollVar } from './opart.js';
import { initSmooth } from './smooth.js';
import { renderShell, initShell, hydrateAuth, initHash } from './shell.js';
import { portalIn } from './shell.js';
import { goLogin } from './api.js';

export async function boot({ setup = () => {}, auth = false } = {}) {
  if (!document.querySelector('link[rel~="icon"]')) document.head.insertAdjacentHTML('beforeend', '<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
  renderShell();
  initSmooth();
  initShell();
  portalIn();
  initScrollVar();
  const user = await hydrateAuth();
  if (auth && !user.user) { goLogin(); return; }
  await setup(user);
  const mainEl = document.querySelector('main');
  let rt;
  const queueRefresh = () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 250); };
  if (mainEl) mainEl.addEventListener('animationend', ev => { if (ev.target === mainEl) queueRefresh(); });
  const run = () => {
    queueRefresh();
    initHash();
    let t;
    let lastH = document.documentElement.scrollHeight;
    new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => {
        const h = document.documentElement.scrollHeight;
        if (Math.abs(h - lastH) > 2) { lastH = h; queueRefresh(); }
      }, 200);
    }).observe(document.body);
    addEventListener('load', queueRefresh);
  };
  if (document.fonts && document.fonts.load) {
    Promise.race([
      Promise.all([document.fonts.load('800 100px "Bricolage Grotesque"'), document.fonts.load('400 16px "Inter"')]),
      new Promise(r => setTimeout(r, 2500))
    ]).then(run);
  } else run();
}
