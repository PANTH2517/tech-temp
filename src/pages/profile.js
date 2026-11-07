import { boot } from '../js/boot.js';
import { $, $$, reduce, toast } from '../js/core.js';
import { gsap } from '../js/gsap.js';
import { api } from '../js/api.js';
import { profileHTML } from '../js/profile-view.js';
import { zoomIn } from '../js/zoom.js';

const parts = location.pathname.split('/').filter(Boolean);
const handle = parts[0] === 'u' && parts[1] ? parts[1] : new URLSearchParams(location.search).get('u');

boot({
  setup: async () => {
    const host = $('[data-pf]');
    let data;
    try {
      data = await api.get(`/people/${encodeURIComponent(handle || '')}`);
    } catch (e) {
      document.title = 'Profile not found — TECHFEST \'27';
      const m = $('[data-missing]');
      m.hidden = false;
      m.innerHTML = `${e.message} <a class="link" href="/people.html">Browse everyone</a>`;
      $('[data-share]').remove();
      return;
    }
    const p = data.person;
    document.title = `${p.name} — TECHFEST '27`;
    document.querySelector('meta[name="description"]').setAttribute('content', `${p.name}${p.headline ? ' · ' + p.headline : ''}. Profile on TECHFEST '27.`);
    host.innerHTML = profileHTML(p);
    if (data.isMe) $('[data-edit]').hidden = false;
    $('[data-share]').addEventListener('click', () => {
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => toast('Profile link copied'), () => toast(location.href));
      else toast(location.href);
    });

    if (!reduce) {
      gsap.from($('[data-pf-cover] svg'), { scale: 1.6, duration: 2, ease: 'expo.out' });
      gsap.from($('[data-pf-av]'), { scale: 0, rotate: -40, duration: 1.3, ease: 'elastic.out(1,.55)', delay: 0.25 });
      gsap.from('.pf__id > *', { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.4 });
      zoomIn($$('.pf__body > section'), { from: 0.9, y: 30, stagger: 0.1 });
      zoomIn($$('.pf__proj, .pf__ev, .pf__badge'), { from: 0.88, y: 18, stagger: 0.06 });
    }
  }
});
