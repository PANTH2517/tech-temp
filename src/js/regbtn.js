import { toast } from './core.js';
import { api } from './api.js';

export function initRegButtons(root, loggedIn, onChange) {
  root.addEventListener('click', async e => {
    const btn = e.target.closest('[data-reg]');
    if (!btn) return;
    if (!loggedIn) {
      location.href = `/login.html?next=${encodeURIComponent(location.pathname + location.search)}&event=${btn.dataset.reg}`;
      return;
    }
    const id = btn.dataset.reg;
    const on = btn.getAttribute('aria-pressed') === 'true';
    btn.disabled = true;
    try {
      if (on) { await api.del(`/registrations/${id}`); toast('Registration removed.'); }
      else { await api.post('/registrations', { eventIds: [id] }); toast('You are registered. See it on your dashboard.'); }
      btn.setAttribute('aria-pressed', String(!on));
      btn.classList.toggle('is-on', !on);
      btn.textContent = on ? 'Register' : 'Registered ✓';
      if (onChange) onChange(id, !on);
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}
