import { boot } from '../js/boot.js';
import { $, $$, esc, reduce } from '../js/core.js';
import { gsap } from '../js/gsap.js';
import { api, resetMe } from '../js/api.js';

const preselect = new URLSearchParams(location.search).get('event');

boot({
  setup: async user => {
    if (user.user) { location.replace('/dashboard.html'); return; }
    const form = $('[data-form]'), status = $('[data-status]');
    const { events } = await api.get('/events');
    $('[data-evpick]').innerHTML = events.map(e => `<label><input type="checkbox" name="ev" value="${esc(e.id)}" ${e.id === preselect ? 'checked' : ''}> <span>${esc(e.title)}</span><small>${esc(e.when)}</small></label>`).join('');

    form.addEventListener('input', e => {
      const i = e.target;
      if (i.name && $(`[data-err="${i.name}"]`, form)) {
        $(`[data-err="${i.name}"]`, form).textContent = '';
        i.removeAttribute('aria-invalid');
      }
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      $$('.field__err', form).forEach(p => { p.textContent = ''; });
      $$('[aria-invalid]', form).forEach(i => i.removeAttribute('aria-invalid'));
      status.className = 'status';
      status.textContent = 'Creating your account…';
      const body = {
        name: form.elements.name.value,
        email: form.elements.email.value,
        password: form.elements.password.value,
        college: form.elements.college.value,
        eventIds: $$('[name="ev"]:checked', form).map(c => c.value)
      };
      try {
        await api.post('/auth/signup', body);
        resetMe();
        location.href = '/dashboard.html?welcome=1#profile';
      } catch (err) {
        status.textContent = err.message;
        status.classList.add('is-bad');
        Object.entries(err.fields || {}).forEach(([k, v]) => {
          const el = $(`[data-err="${k}"]`, form);
          if (el) el.textContent = v;
          if (form.elements[k]) form.elements[k].setAttribute('aria-invalid', 'true');
        });
        const bad = $('[aria-invalid="true"]', form);
        if (bad) bad.focus();
      }
    });
    if (!reduce) gsap.from('.auth > *', { opacity: 0, scale: 0.94, y: 30, duration: 1, ease: 'expo.out', stagger: 0.12 });
  }
});
