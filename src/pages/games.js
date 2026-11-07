import { boot } from '../js/boot.js';
import { $, $$, esc, reduce, toast } from '../js/core.js';
import { gsap } from '../js/gsap.js';
import { api } from '../js/api.js';
import { zoomIn } from '../js/zoom.js';

const fmt = {
  triangle: v => (v / 1000).toFixed(2) + ' s',
  liar: v => v + ' in a row',
  zeno: v => v + ' pts'
};

let guestName = () => 'Guest';

async function loadBoard(game, root) {
  try {
    const d = await api.get(`/scores/${game}`);
    paintBoard(game, root, d.scores);
  } catch (e) {
    $('[data-board]', root).innerHTML = '<li class="board__empty">Leaderboard unavailable.</li>';
  }
}

function paintBoard(game, root, rows) {
  $('[data-board]', root).innerHTML = rows.length
    ? rows.map((r, i) => `<li><span>${i + 1}</span><b>${esc(r.name)}</b><em>${fmt[game](r.score)}</em></li>`).join('')
    : '<li class="board__empty">No scores yet. Be the first.</li>';
}

async function submit(game, score, root) {
  try {
    const d = await api.post('/scores', { game, score, name: guestName() });
    paintBoard(game, root, d.scores);
  } catch (e) {
    toast(e.message);
  }
}

function triangle(root) {
  const stage = $('[data-pen]', root), msg = $('[data-msg]', root), warm = $('.warm i', root);
  const start = $('[data-start]', root), lock = $('[data-lock]', root);
  let running = false, t0 = 0, penalty = 0;
  const ctrl = initPenroseGame(stage, v => { warm.style.width = (running ? v : 0) + '%'; });
  if (!ctrl) { msg.textContent = '3D is not available on this device, so this game cannot run here.'; start.disabled = true; return; }
  start.addEventListener('click', () => {
    running = true;
    penalty = 0;
    const z = (0.9 + Math.random() * 4.4) * (Math.random() < 0.5 ? 1 : -1);
    ctrl.set((Math.random() - 0.5) * 1.0, z);
    t0 = performance.now();
    lock.disabled = false;
    start.textContent = 'Restart';
    msg.textContent = 'Drag the triangle until it closes, then lock it in.';
  });
  lock.addEventListener('click', () => {
    if (!running) return;
    const ill = ctrl.illusion();
    if (ill >= 95) {
      running = false;
      lock.disabled = true;
      warm.style.width = '100%';
      const ms = Math.round(performance.now() - t0 + penalty);
      msg.textContent = `Locked in ${(ms / 1000).toFixed(2)} s${penalty ? ` (includes ${penalty / 1000} s of penalties)` : ''}.`;
      submit('triangle', ms, root);
    } else {
      penalty += 3000;
      msg.textContent = `Not closed yet: it is only ${ill}% intact. +3 s penalty.`;
    }
  });
  loadBoard('triangle', root);
}

function initPenroseGame(stage, onIll) {
  let ctrl = null;
  import('../js/penrose.js').then(m => { ctrl = m.initPenrose(stage, { snap: false, silent: true, onIllusion: onIll }); });
  return {
    set: (x, z) => ctrl && ctrl.set(x, z),
    illusion: () => (ctrl ? ctrl.illusion() : 0),
    ready: () => !!ctrl
  };
}

function statement() {
  const kind = Math.floor(Math.random() * 4);
  const truthy = Math.random() < 0.5;
  if (kind === 0) {
    const k = truthy ? 5 : [3, 4, 6, 7][Math.floor(Math.random() * 4)];
    return { s: `This sentence has ${k} words.`, t: k === 5 };
  }
  if (kind === 1) {
    const a = 3 + Math.floor(Math.random() * 40), b = 2 + Math.floor(Math.random() * 40);
    const c = truthy ? a + b : a + b + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 3));
    return { s: `${a} plus ${b} equals ${c}.`, t: a + b === c };
  }
  if (kind === 2) {
    const k = truthy ? 29 : [26, 27, 28, 30, 31, 32][Math.floor(Math.random() * 6)];
    return { s: `This sentence has exactly ${k} letters.`, t: k === 29 };
  }
  const w = ['paradox', 'festival', 'impossible', 'staircase', 'illusion', 'infinite', 'contradict'][Math.floor(Math.random() * 7)];
  const k = truthy ? w.length : w.length + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));
  return { s: `The word "${w}" has ${k} letters.`, t: k === w.length };
}

function liar(root) {
  const msg = $('[data-msg]', root), sentence = $('[data-sentence]', root), bar = $('[data-time]', root), streakEl = $('[data-streak]', root);
  const start = $('[data-start]', root), btns = $$('[data-ans]', root);
  let streak = 0, cur = null, raf = 0, tStart = 0, limit = 4200, playing = false;
  const next = () => {
    cur = statement();
    sentence.textContent = cur.s;
    limit = Math.max(1700, 4200 - streak * 160);
    tStart = performance.now();
    cancelAnimationFrame(raf);
    const loop = () => {
      const p = (performance.now() - tStart) / limit;
      bar.style.width = Math.max(0, 100 - p * 100) + '%';
      if (p >= 1) { end('Time ran out.'); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  };
  const end = why => {
    playing = false;
    cancelAnimationFrame(raf);
    btns.forEach(b => { b.disabled = true; });
    msg.textContent = `${why} Final streak: ${streak}.`;
    start.textContent = 'Play again';
    start.disabled = false;
    if (streak > 0) submit('liar', streak, root);
  };
  const answer = v => {
    if (!playing) return;
    if (v === cur.t) {
      streak++;
      streakEl.textContent = streak;
      if (!reduce) gsap.fromTo(streakEl, { scale: 1.6 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' });
      next();
    } else end(`That sentence was ${cur.t ? 'true' : 'false'}.`);
  };
  btns.forEach(b => b.addEventListener('click', () => answer(b.dataset.ans === 'true')));
  addEventListener('keydown', e => {
    if (!playing) return;
    if (e.key === 't' || e.key === 'T') answer(true);
    if (e.key === 'f' || e.key === 'F') answer(false);
  });
  start.addEventListener('click', () => {
    streak = 0;
    streakEl.textContent = '0';
    playing = true;
    start.disabled = true;
    btns.forEach(b => { b.disabled = false; });
    msg.textContent = 'Go. Is it true or false?';
    next();
  });
  loadBoard('liar', root);
}

function zeno(root) {
  const msg = $('[data-msg]', root), v = $('[data-v]', root), z = $('[data-z]', root);
  const start = $('[data-start]', root), stop = $('[data-stop]', root);
  const TAU = 2.2;
  const target = -TAU * Math.log2(1 - 9 / 10);
  let t0 = 0, raf = 0, running = false;
  const val = t => 10 * (1 - Math.pow(2, -t / TAU));
  const loop = () => {
    const t = (performance.now() - t0) / 1000;
    const x = val(t);
    if (t < target * 0.68) v.textContent = x.toFixed(2);
    else v.textContent = '?.??';
    z.style.width = x * 10 + '%';
    if (t > target * 3) { finish(t, true); return; }
    raf = requestAnimationFrame(loop);
  };
  const finish = (t, timeout) => {
    running = false;
    cancelAnimationFrame(raf);
    stop.disabled = true;
    start.disabled = false;
    start.textContent = 'Play again';
    const x = val(t);
    v.textContent = x.toFixed(2);
    z.style.width = x * 10 + '%';
    const err = Math.abs(t - target);
    const pts = timeout ? 0 : Math.max(0, Math.round(1000 - err * 700));
    msg.textContent = timeout ? 'Too slow, the clock ran away.' : `You stopped at ${x.toFixed(2)}. That is ${err.toFixed(2)} s off. Score: ${pts}.`;
    if (pts > 0) submit('zeno', pts, root);
  };
  start.addEventListener('click', () => {
    running = true;
    start.disabled = true;
    stop.disabled = false;
    msg.textContent = 'Watch it slow down, then trust your gut.';
    t0 = performance.now();
    raf = requestAnimationFrame(loop);
  });
  stop.addEventListener('click', () => { if (running) finish((performance.now() - t0) / 1000, false); });
  loadBoard('zeno', root);
}

boot({
  setup: async user => {
    const nameWrap = $('[data-name-wrap]');
    if (user.user) { nameWrap.hidden = true; guestName = () => user.user.name.split(' ')[0]; }
    else {
      const input = $('[data-name]');
      try { input.value = localStorage.getItem('tf-name') || ''; } catch (e) {}
      guestName = () => { const n = input.value.trim().slice(0, 20) || 'Guest'; try { localStorage.setItem('tf-name', n); } catch (e) {} return n; };
    }
    triangle($('[data-g="triangle"]'));
    liar($('[data-g="liar"]'));
    zeno($('[data-g="zeno"]'));
    zoomIn($$('.game'), { from: 0.9, y: 36, stagger: 0.12 });
  }
});
