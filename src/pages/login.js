import { boot } from '../js/boot.js';
import { $, $$, reduce } from '../js/core.js';
import { gsap } from '../js/gsap.js';
import { api, resetMe } from '../js/api.js';

const params = new URLSearchParams(location.search);
const rawNext = params.get('next') || '/dashboard.html';
const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard.html';
const eventId = params.get('event');

boot({
  setup: async user => {
    if (user.user) { location.replace(next); return; }
    const form = $('[data-form]'), status = $('[data-status]');
    $('[data-reg-link]').href = `/register.html${eventId ? `?event=${encodeURIComponent(eventId)}` : ''}`;
    $('[data-demo]').addEventListener('click', () => {
      form.elements.email.value = 'demo@techfest.dev';
      form.elements.password.value = 'password123';
      form.elements.password.focus();
    });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      $$('.field__err', form).forEach(p => { p.textContent = ''; });
      status.className = 'status';
      const email = form.elements.email.value.trim(), password = form.elements.password.value;
      if (!email || !password) {
        status.textContent = 'Enter your email and password.';
        status.classList.add('is-bad');
        return;
      }
      status.textContent = 'Logging in…';
      try {
        await api.post('/auth/login', { email, password });
        resetMe();
        if (eventId) await api.post('/registrations', { eventIds: [eventId] }).catch(() => {});
        location.href = next;
      } catch (err) {
        status.textContent = err.message;
        status.classList.add('is-bad');
      }
    });
    if (!reduce) gsap.from('.auth > *', { opacity: 0, scale: 0.94, y: 30, duration: 1, ease: 'expo.out', stagger: 0.12 });
  }
});
