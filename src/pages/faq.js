import { boot } from '../js/boot.js';
import { $, $$, esc, reduce } from '../js/core.js';
import { gsap } from '../js/gsap.js';
import { api } from '../js/api.js';

boot({
  setup: async () => {
    const { faq } = await api.get('/faq');
    $('[data-faq]').innerHTML = faq.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
    const form = $('[data-form]'), status = $('[data-status]');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      $$('.field__err', form).forEach(p => { p.textContent = ''; });
      $$('[aria-invalid]', form).forEach(i => i.removeAttribute('aria-invalid'));
      status.className = 'status';
      status.textContent = 'Sending…';
      try {
        await api.post('/contact', { name: form.elements.name.value, email: form.elements.email.value, message: form.elements.message.value });
        form.reset();
        status.textContent = 'Message sent. We will reply by email.';
        status.classList.add('is-ok');
      } catch (err) {
        status.textContent = err.message;
        status.classList.add('is-bad');
        Object.entries(err.fields || {}).forEach(([k, v]) => {
          const el = $(`[data-err="${k}"]`, form);
          if (el) el.textContent = v;
          if (form.elements[k]) form.elements[k].setAttribute('aria-invalid', 'true');
        });
      }
    });
    if (!reduce) gsap.from('.faqgrid > *', { opacity: 0, scale: 0.95, y: 30, duration: 1, ease: 'expo.out', stagger: 0.12 });
  }
});
