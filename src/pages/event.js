import { boot } from '../js/boot.js';
import { $, esc, reduce, toast } from '../js/core.js';
import { gsap } from '../js/gsap.js';
import { api, goLogin } from '../js/api.js';
import { avatar } from '../js/ui.js';
import { zoomHead } from '../js/zoom.js';

const parts = location.pathname.split('/').filter(Boolean);
const id = parts[0] === 'events' && parts[1] ? parts[1] : new URLSearchParams(location.search).get('id');

function initTwin(ev) {
  const btn = $('[data-twin]');
  const title = $('[data-title]');
  if (!ev.twin) { btn.remove(); return; }
  let on = false;
  btn.addEventListener('click', () => {
    on = !on;
    btn.setAttribute('aria-pressed', String(on));
    btn.lastChild.textContent = on ? ' Back to the real event' : ' Flip to the false twin';
    document.body.classList.toggle('is-twin', on);
    const set = () => { title.textContent = on ? ev.twin : ev.title; };
    if (reduce) { set(); return; }
    gsap.to(title, { rotationX: -90, opacity: 0, duration: 0.28, ease: 'power2.in', onComplete: () => { set(); gsap.fromTo(title, { rotationX: 90 }, { rotationX: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }); } });
  });
}

boot({
  setup: async user => {
    let data;
    try {
      data = await api.get(`/events/${encodeURIComponent(id || '')}`);
    } catch (e) {
      document.title = 'Event not found — TECHFEST \'27';
      $('[data-crumb]').textContent = 'Not found';
      $('[data-title]').textContent = 'Event not found';
      $('[data-twin]').remove();
      $('[data-body]').innerHTML = '<div class="empty">We could not find that event. <a class="link" href="/events.html">See all events</a></div>';
      return;
    }
    const { event: ev, attendees, prev, next } = data;
    document.title = `${ev.title} — TECHFEST '27`;
    document.querySelector('meta[name="description"]').setAttribute('content', `${ev.title} at TECHFEST '27: ${ev.description}`);
    $('[data-crumb]').textContent = ev.title;
    $('[data-title]').textContent = ev.title;
    initTwin(ev);
    $('[data-tags]').innerHTML = `<span class="chip">${esc(ev.cat)}</span><span class="chip">${esc(ev.kind)}</span>`;
    $('[data-desc]').textContent = ev.description;
    $('[data-rules]').innerHTML = ev.rules.map(r => `<li>${esc(r)}</li>`).join('');
    $('[data-facts]').innerHTML = [['When', ev.when], ['Venue', ev.venue], ['Team size', ev.team], ['Prize', ev.prize]].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    const meter = $('[data-meter] i'), regCount = $('[data-reg-count]'), spots = $('[data-spots]');
    const paint = e => {
      meter.style.width = Math.min(100, Math.round(e.registered / e.capacity * 100)) + '%';
      regCount.textContent = `${e.registered} registered`;
      spots.textContent = e.spotsLeft === 0 ? 'Full' : `${e.spotsLeft} spots left`;
    };
    paint(ev);

    const btn = $('[data-reg]');
    const setBtn = on => {
      btn.textContent = on ? 'Registered ✓ (click to cancel)' : ev.spotsLeft === 0 ? 'Event is full' : 'Register for this event';
      btn.classList.toggle('btn--lime', !on);
      btn.disabled = ev.spotsLeft === 0 && !on;
      btn.dataset.on = String(on);
    };
    setBtn(ev.isRegistered);
    btn.addEventListener('click', async () => {
      if (!user.user) { goLogin(); return; }
      const on = btn.dataset.on === 'true';
      btn.disabled = true;
      try {
        if (on) { await api.del(`/registrations/${ev.id}`); ev.registered--; ev.spotsLeft++; toast('Registration removed.'); }
        else { await api.post('/registrations', { eventIds: [ev.id] }); ev.registered++; ev.spotsLeft--; toast('You are registered.'); }
        paint(ev);
        setBtn(!on);
      } catch (err) {
        toast(err.message);
      } finally {
        btn.disabled = false;
      }
    });
    $('[data-share]').addEventListener('click', () => {
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => toast('Link copied'), () => toast(location.href));
      else toast(location.href);
    });

    $('[data-attend]').innerHTML = attendees.length
      ? attendees.map(p => `<a href="/u/${esc(p.handle)}" title="${esc(p.name)}" aria-label="${esc(p.name)}">${avatar(p)}</a>`).join('')
      : '<p class="lede">Be the first public profile on this event.</p>';
    $('[data-pn]').innerHTML = `<a href="/events/${esc(prev.id)}"><small>← Previous event</small><b>${esc(prev.title)}</b></a><a href="/events/${esc(next.id)}"><small>Next event →</small><b>${esc(next.title)}</b></a>`;

    zoomHead($('[data-title]'));
    if (!reduce) gsap.from('.evd > *', { opacity: 0, y: 40, scale: 0.96, duration: 1, ease: 'expo.out', stagger: 0.12, delay: 0.2 });
  }
});
