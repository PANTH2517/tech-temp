import { boot } from '../js/boot.js';
import { $, $$, esc, reduce } from '../js/core.js';
import { gsap, ScrollTrigger } from '../js/gsap.js';
import { api } from '../js/api.js';
import { avatar, eventCard } from '../js/ui.js';
import { countUp, heroDepth, portalZoom, zoomIn } from '../js/zoom.js';
import { initStairSection } from '../js/stair-section.js';
import { initBands } from '../js/opart.js';


let sceneApi = null;
const loadScene = () => import('../js/scene.js').then(m => {
  if (m.initScene()) { sceneApi = m; m.playSceneIntro(); } else document.documentElement.classList.add('no-gl');
});
const small = innerWidth < 700;
const idle = window.requestIdleCallback || (cb => setTimeout(cb, 200));
const later = () => (small ? setTimeout(() => idle(loadScene, { timeout: 2500 }), 900) : idle(loadScene, { timeout: 1200 }));
if (reduce || small) document.documentElement.classList.add('no-gl'); else if (document.readyState === 'complete') later(); else addEventListener('load', later);


boot({
  setup: async user => {
    const [site, ev, sched, ppl, sp] = await Promise.all([
      api.get('/site'), api.get('/events'), api.get('/schedule'), api.get('/people'), api.get('/sponsors')
    ]);

    const days = Math.max(0, Math.ceil((new Date(site.start) - Date.now()) / 864e5));
    $('[data-days]').textContent = days;


    $('[data-days-grid]').innerHTML = sched.days.map(d => `<article class="daycard">
      <h3>${esc(d.label)}</h3><small>${esc(d.date)} · ${esc(d.theme)}</small>
      <ul>${d.slots.slice(0, 4).map(s => `<li><b>${esc(s.time)}</b><span>${esc(s.title)}</span></li>`).join('')}</ul>
    </article>`).join('');

    $('[data-people]').innerHTML = ppl.people.slice(0, 6).map(p => `<a class="pcard" href="/u/${esc(p.handle)}" style="--av:${esc(p.accent)}">
      <span class="pcard__top">${avatar(p)}<span><h3>${esc(p.name)}</h3><span class="pcard__college">${esc(p.college)}</span></span></span>
      <p class="pcard__headline">${esc(p.headline)}</p>
      <span class="pcard__tags">${p.skills.slice(0, 3).map(s => `<span class="chip">${esc(s)}</span>`).join('')}</span>
    </a>`).join('');

    $('[data-spons]').innerHTML = sp.sponsors.map(s => `<div><b>${esc(s.name)}</b><small>${esc(s.tier)}</small></div>`).join('');

    const stage = $('[data-pen]');
    const startPenrose = () => import('../js/penrose.js').then(m => m.initPenrose(stage));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(en => { if (en[0].isIntersecting) { io.disconnect(); startPenrose(); } }, { rootMargin: '600px 0px' });
      io.observe(stage);
    } else startPenrose();

    const s = site.stats;
    const vals = { events: s.events, days: s.days, participants: s.participants, colleges: s.colleges };
    ScrollTrigger.create({
      trigger: $('[data-portal]'),
      start: 'top 15%',
      once: true,
      onEnter: () => $$('[data-n]').forEach(el => countUp(el, vals[el.dataset.n], { duration: 2.2 }))
    });
    if (reduce) $$('[data-n]').forEach(el => { el.textContent = vals[el.dataset.n].toLocaleString('en-IN'); });

    initBands();
    portalZoom($('[data-portal]'));
    await initStairSection(ev.events, !!user.user);
    heroDepth($('[data-hero]'));
    zoomIn($$('[data-zin]'), { from: 0.84, y: 40, stagger: 0.12 });
    zoomIn($$('.daycard'), { from: 0.88, stagger: 0.12 });
    zoomIn($$('.pcard'), { from: 0.82, stagger: 0.07 });
    zoomIn($$('.spons div'), { from: 0.9, y: 14, stagger: 0.03 });
    void sceneApi;
  }
});
