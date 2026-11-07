import { boot } from '../js/boot.js';
import { $, $$, esc, reduce } from '../js/core.js';
import { gsap } from '../js/gsap.js';
import { api } from '../js/api.js';
import { avatar } from '../js/ui.js';
import { zoomIn } from '../js/zoom.js';

const tones = ['#C6FF3D', '#7DD3FC', '#FF7A59', '#F9A8D4', '#A78BFA', '#6EE7B7', '#FDE68A', '#FB923C'];
const emojis = ['🧭', '🎪', '💻', '🎨', '🤝', '🚚', '📣', '🛎️'];

function detail(p) {
  const box = $('[data-detail]');
  box.innerHTML = `<div class="tmdetail__row">${avatar({ accent: p.accent, initials: p.initials })}<div><h2>${esc(p.name)}</h2><p class="role">${esc(p.college)}</p><p class="bio">${esc(p.headline)}</p></div></div>`;
  if (!reduce) gsap.from(box.firstElementChild, { opacity: 0, y: 16, duration: 0.6, ease: 'expo.out' });
}

async function startCloud(members) {
  const wrap = $('[data-cloud-wrap]');
  if (reduce || innerWidth < 700) { wrap.hidden = true; return; }
  const host = $('[data-cloud]'), tip = $('[data-tip]');
  try {
    const mod = await import('../js/cloud.js');
    mod.createCloud(host, members, {
      onOpen: p => detail(p),
      onHover: p => {
        if (!p) { tip.hidden = true; return; }
        tip.innerHTML = '<b>' + esc(p.name) + '</b><span>' + esc(p.college) + '</span>';
        tip.hidden = false;
      }
    });
    host.addEventListener('pointermove', e => {
      const r = host.getBoundingClientRect();
      tip.style.left = Math.min(r.width - 250, e.clientX - r.left + 16) + 'px';
      tip.style.top = Math.max(8, e.clientY - r.top - 60) + 'px';
    });
    detail(members[0]);
  } catch (err) {
    wrap.hidden = true;
  }
}

boot({
  setup: async () => {
    const data = await api.get('/team');
    const team = data.team || data;
    const host = $('[data-team]');
    host.innerHTML = team.map((m, i) => `<article class="tm">${avatar({ accent: tones[i % tones.length], initials: m.initials })}<h2>${esc(m.name)}</h2><p class="role">${esc(m.role)}</p><p class="bio">${esc(m.bio)}</p></article>`).join('');
    zoomIn($$('.tm', host), { from: 0.84, stagger: 0.07 });
    const members = team.map((m, i) => ({ handle: 'm' + i, name: m.name, college: m.role, headline: m.bio, accent: tones[i % tones.length], emoji: emojis[i % emojis.length], initials: m.initials }));
    (window.requestIdleCallback ? (cb => setTimeout(() => window.requestIdleCallback(cb, { timeout: 1500 }), innerWidth < 700 ? 1200 : 0)) : (cb => setTimeout(cb, 500)))(() => startCloud(members));
  }
});
