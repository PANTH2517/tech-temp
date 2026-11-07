import { boot } from '../js/boot.js';
import { $, $$, esc, reduce } from '../js/core.js';
import { gsap, Flip } from '../js/gsap.js';
import { api } from '../js/api.js';
import { avatar } from '../js/ui.js';
import { zoomIn } from '../js/zoom.js';

boot({
  setup: async () => {
    const grid = $('[data-grid]'), count = $('[data-count]'), empty = $('[data-empty]'), skillSel = $('[data-skill]');
    const data = await api.get('/people');
    const people = data.people;
    skillSel.insertAdjacentHTML('beforeend', data.skills.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join(''));
    grid.innerHTML = people.map(p => `<a class="pcard" href="/u/${esc(p.handle)}" data-h="${esc(p.handle)}" data-flip-id="${esc(p.handle)}" style="--av:${esc(p.accent)}">
      <span class="pcard__top">${avatar(p)}<span><h2>${esc(p.name)}</h2><span class="pcard__college">${esc(p.college)}</span></span></span>
      <p class="pcard__headline">${esc(p.headline || 'Just joined')}</p>
      <span class="pcard__tags">${p.skills.map(s => `<span class="chip">${esc(s)}</span>`).join('')}</span>
      <span class="pcard__ev">${p.eventCount} event${p.eventCount === 1 ? '' : 's'} registered</span>
    </a>`).join('');

    let q = '', skill = '';
    const apply = animate => {
      const cards = $$('.pcard', grid);
      const state = animate && !reduce ? Flip.getState(cards.filter(c => !c.hidden)) : null;
      let shown = 0;
      cards.forEach(c => {
        const p = people.find(x => x.handle === c.dataset.h);
        const on = (!q || `${p.name} ${p.college} ${p.headline} ${p.handle}`.toLowerCase().includes(q)) && (!skill || p.skills.some(s => s.toLowerCase() === skill));
        c.hidden = !on;
        if (on) shown++;
      });
      count.textContent = `Showing ${shown} of ${people.length} people`;
      empty.hidden = shown > 0;
      if (state) Flip.from(state, {
        duration: 0.6, ease: 'power3.inOut', absolute: true, stagger: 0.02,
        onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.2, ease: 'expo.out' }),
        onLeave: els => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.2 })
      });
    };
    apply(false);
    zoomIn($$('.pcard', grid), { from: 0.8, stagger: 0.05 });
    $('[data-q]').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); apply(true); });
    skillSel.addEventListener('change', e => { skill = e.target.value.toLowerCase(); apply(true); });
  }
});
