import { boot } from '../js/boot.js';
import { $, $$, reduce } from '../js/core.js';
import { gsap, Flip } from '../js/gsap.js';
import { api } from '../js/api.js';
import { eventCard, initCardFx } from '../js/ui.js';
import { zoomIn } from '../js/zoom.js';
import { initRegButtons } from '../js/regbtn.js';

boot({
  setup: async user => {
    const grid = $('[data-grid]'), pills = $('[data-pills]'), count = $('[data-count]'), empty = $('[data-empty]');
    const data = await api.get('/events');
    let events = data.events;
    let cat = 'All', q = '', sort = 'time';

    pills.innerHTML = data.categories.map(c => `<button class="pill" type="button" aria-pressed="${c === 'All'}" data-cat="${c}">${c}</button>`).join('');

    const order = list => [...list].sort((a, b) => sort === 'prize' ? b.prizeAmount - a.prizeAmount : sort === 'spots' ? b.spotsLeft - a.spotsLeft : a.day - b.day || a.time.localeCompare(b.time));

    const build = () => {
      grid.innerHTML = order(events).map((e, i) => eventCard(e, i, 2)).join('');
    };

    const apply = animate => {
      const cards = $$('.ecard', grid);
      const state = animate && !reduce ? Flip.getState(cards.filter(c => !c.hidden)) : null;
      const term = q.trim().toLowerCase();
      let shown = 0;
      cards.forEach(c => {
        const e = events.find(x => x.id === c.dataset.id);
        const on = (cat === 'All' || e.cat === cat) && (!term || `${e.title} ${e.kind} ${e.cat} ${e.tags.join(' ')}`.toLowerCase().includes(term));
        c.hidden = !on;
        if (on) shown++;
      });
      count.textContent = `Showing ${shown} of ${events.length} events`;
      empty.hidden = shown > 0;
      if (state) {
        Flip.from(state, {
          duration: 0.7,
          ease: 'power3.inOut',
          absolute: true,
          stagger: 0.03,
          onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.2, ease: 'expo.out' }),
          onLeave: els => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.25 })
        });
      }
    };

    build();
    apply(false);
    initRegButtons(grid, !!user.user);
    initCardFx(grid);
    zoomIn($$('.ecard', grid), { from: 0.86, stagger: 0.06 });

    pills.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      cat = b.dataset.cat;
      $$('[data-cat]', pills).forEach(x => x.setAttribute('aria-pressed', x === b));
      apply(true);
    });
    $('[data-q]').addEventListener('input', e => { q = e.target.value; apply(true); });
    $('[data-sort]').addEventListener('change', e => {
      sort = e.target.value;
      build();
      apply(false);
      if (!reduce) gsap.from($$('.ecard', grid), { opacity: 0, scale: 0.9, duration: 0.6, ease: 'expo.out', stagger: 0.04 });
    });
  }
});
