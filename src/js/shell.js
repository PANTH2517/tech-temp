import { $, $$, esc, reduce, scrollToEl, sc, toast } from './core.js';
import { gsap, ScrollTrigger } from './gsap.js';
import { api, me, resetMe } from './api.js';
import { avatar } from './ui.js';

const LINKS = [
  { href: '/events.html', label: 'Events' },
  { href: '/schedule.html', label: 'Schedule' },
  { href: '/people.html', label: 'People' },
  { href: '/games.html', label: 'Arcade' },
  { href: '/team.html', label: 'Team' },
  { href: '/faq.html', label: 'FAQ' }
];

const norm = p => (p.replace(/index\.html$/, '').replace(/\/$/, '') || '/');
const here = () => norm(location.pathname);
const isCurrent = href => norm(new URL(href, location.origin).pathname) === here();

const logo = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 37 33H3z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 12 29 28H11z" fill="currentColor"/></svg>';

const authLoggedOut = '<a class="nav__login" href="/login.html">Log in</a><a class="btn btn--lime btn--sm" href="/register.html">Join</a>';
const authIn = u => `<a class="nav__me" href="/dashboard.html" aria-label="Your dashboard">${avatar({ accent: u.accent, emoji: u.emoji, initials: u.user.initials }, 'av--sm')}<span>${esc(u.user.name.split(' ')[0])}</span></a>`;

export function renderShell() {
  const links = LINKS.map(l => `<a href="${l.href}" ${isCurrent(l.href) ? 'aria-current="page"' : ''}>${l.label}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `
    <a class="skip" href="#main">Skip to content</a>
    <header class="nav" data-nav>
      <div class="nav__pill">
        <a class="brand" href="/" aria-label="TECHFEST '27 home">${logo}<span>TECHFEST <b>'27</b></span></a>
        <nav class="nav__links" aria-label="Main">${links}</nav>
        <div class="nav__auth" data-auth>${authLoggedOut}</div>
        <button class="nav__burger" type="button" data-burger aria-expanded="false" aria-controls="mnav" aria-label="Open menu"><i></i><i></i></button>
      </div>
      <nav class="mnav" id="mnav" data-mnav aria-label="Mobile" hidden>
        ${links}<div data-mauth></div>
      </nav>
    </header>
    <div class="toast" data-toast role="status" aria-live="polite"></div>
    <div class="warp" data-warp aria-hidden="true" hidden><i class="warp__ring"></i></div>`);
  document.body.insertAdjacentHTML('beforeend', `
    <footer class="foot">
      <div class="wrap">
        <p class="foot__word" aria-hidden="true"></p>
        <div class="foot__in">
          <div><p class="foot__h">Festival</p><p>12 – 14 February 2027</p><p>NMIMS MPSTME, Shirpur</p><p>Theme: Paradox</p></div>
          <div><p class="foot__h">Explore</p><a href="/events.html">Events</a><a href="/schedule.html">Schedule</a><a href="/people.html">People</a><a href="/team.html">Team</a></div>
          <div><p class="foot__h">Account</p><a href="/register.html">Create account</a><a href="/login.html">Log in</a><a href="/dashboard.html">Dashboard</a><a href="/faq.html">FAQ & contact</a></div>
          <div><p class="foot__h">Contact</p><p>techfest@college.example</p><p>+91 00000 00000</p></div>
        </div>
        <div class="foot__legal"><span>© TECHFEST '27</span><span>All names, dates, sponsors and prizes are placeholder content.</span></div>
      </div>
    </footer>`);
}

export async function hydrateAuth() {
  const u = await me();
  const slot = $('[data-auth]'), m = $('[data-mauth]');
  if (u.user) {
    slot.innerHTML = authIn(u);
    m.innerHTML = `<a href="/dashboard.html">Dashboard</a><a href="/u/${esc(u.handle)}">My public profile</a><button type="button" data-logout>Log out</button>`;
  } else {
    m.innerHTML = '<a href="/login.html">Log in</a><a class="btn btn--lime" href="/register.html">Create account</a>';
  }
  $$('[data-logout]').forEach(b => b.addEventListener('click', async () => {
    await api.post('/auth/logout');
    resetMe();
    location.href = '/';
  }));
  return u;
}

function initMenu() {
  const burger = $('[data-burger]'), panel = $('[data-mnav]'), bar = $('[data-nav]');
  let open = false;
  const set = next => {
    open = next;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    bar.classList.toggle('is-open', open);
    if (open) { panel.hidden = false; if (!reduce) gsap.fromTo(panel, { opacity: 0, y: -10, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }); }
    else panel.hidden = true;
  };
  burger.addEventListener('click', () => set(!open));
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) { set(false); burger.focus(); } });
  panel.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  addEventListener('resize', () => { if (open && innerWidth > 900) set(false); });
  const onScroll = () => bar.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initLinks() {
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (norm(url.pathname) === here()) {
      e.preventDefault();
      if (url.hash) {
        const el = document.getElementById(url.hash.slice(1));
        if (el) scrollToEl(el);
      } else if (sc.lenis) sc.lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    if (reduce) return;
    e.preventDefault();
    const r = a.getBoundingClientRect();
    const px = e.clientX || r.left + r.width / 2, py = e.clientY || r.top + r.height / 2;
    portalOut(url.href, px, py);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('is-leaving'); });
}

const warpR = () => Math.round(Math.hypot(innerWidth, innerHeight) * 1.15);

function portalOut(href, x, y) {
  const w = $('[data-warp]');
  document.body.classList.add('is-leaving');
  if (!w) { setTimeout(() => { location.href = href; }, 320); return; }
  const ring = $('.warp__ring', w);
  w.hidden = false;
  w.style.setProperty('--wx', x + 'px');
  w.style.setProperty('--wy', y + 'px');
  gsap.set(w, { '--r': warpR() + 'px' });
  gsap.set(ring, { rotation: 0 });
  try { sessionStorage.setItem('tf-warp', x + ',' + y); } catch (err) {}
  gsap.to(ring, { rotation: 140, duration: 0.7, ease: 'power2.in' });
  gsap.to(w, { '--r': '0px', duration: 0.7, ease: 'power3.in', onComplete: () => { location.href = href; } });
}

export function portalIn() {
  let v = null;
  try { v = sessionStorage.getItem('tf-warp'); sessionStorage.removeItem('tf-warp'); } catch (err) {}
  const w = $('[data-warp]');
  if (!v || !w || reduce) return;
  const [x, y] = v.split(',').map(Number);
  const ring = $('.warp__ring', w);
  w.hidden = false;
  w.style.setProperty('--wx', x + 'px');
  w.style.setProperty('--wy', y + 'px');
  gsap.set(w, { '--r': '0px' });
  gsap.set(ring, { rotation: -140 });
  gsap.to(ring, { rotation: 0, duration: 0.95, ease: 'power2.out' });
  gsap.to(w, { '--r': warpR() + 'px', duration: 0.95, ease: 'power3.out', delay: 0.05, onComplete: () => { w.hidden = true; } });
}

export function initShell() {
  initMenu();
  initLinks();
}

export function initHash() {
  if (!location.hash) return;
  const el = document.getElementById(location.hash.slice(1));
  if (el) setTimeout(() => scrollToEl(el), 500);
}

export { toast, ScrollTrigger };
