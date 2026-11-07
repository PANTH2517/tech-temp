import { site, events as EVENTS, days as DAYS, slots as SLOTS, team as TEAM, sponsors as SPONSORS, faq as FAQ, users as SEED_USERS } from '../data/seed-data.js';

const KEY = 'tf27-demo-v1';
const HEX = /^#[0-9a-fA-F]{6}$/;
const HANDLE = /^[a-z0-9_]{3,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const THEMES = ['dark', 'light', 'aurora'];
const LAYOUTS = ['cards', 'timeline', 'minimal'];
const COVERS = ['mobius', 'grid', 'dots', 'waves'];
const GAMES = { triangle: 'asc', zeno: 'desc', liar: 'desc' };
const DEMO_PASSWORD = 'password123';

class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
const stamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

function hashPw(pw) {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) | 0;
  return 'd' + (h >>> 0).toString(36) + pw.length;
}

function seedState() {
  const s = { nextId: 1, users: [], profiles: {}, regs: [], scores: [], messages: [], session: null };
  SEED_USERS.forEach((u, i) => {
    const id = s.nextId++;
    s.users.push({ id, email: u.email, name: u.name, college: u.college, pw: hashPw(DEMO_PASSWORD), created_at: `2026-1${i % 3}-${String(10 + i).padStart(2, '0')} 10:${String(10 + i).padStart(2, '0')}:00` });
    s.profiles[id] = { handle: u.handle, headline: u.headline, bio: u.bio, accent: u.accent, theme: u.theme, layout: u.layout, cover: u.cover, emoji: u.emoji, links: u.links, skills: u.skills, projects: u.projects, sections: { events: true, badges: true, projects: true, links: true }, isPublic: true, updated: `2026-11-${String(30 - i).padStart(2, '0')} 09:00:00` };
    u.events.forEach((eid, k) => s.regs.push({ uid: id, eid, at: `2026-1${i % 3}-${String(12 + i).padStart(2, '0')} 1${k}:30:00` }));
  });
  [['triangle', 'Aanya', 6200], ['triangle', 'Rohan', 8900], ['triangle', 'Sara', 11400], ['zeno', 'Kabir', 980], ['zeno', 'Meera', 940], ['zeno', 'Arjun', 870], ['liar', 'Zoya', 14], ['liar', 'Neel', 11], ['liar', 'Tara', 9]]
    .forEach(([game, name, score]) => s.scores.push({ game, name, score }));
  return s;
}

let state = null;
function load() {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch (e) {
    state = null;
  }
  if (!state) state = seedState();
  return state;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
}

const userById = id => load().users.find(u => u.id === id);
const me = () => (load().session ? userById(load().session) : null);

function eventRow(e, i, uid) {
  const s = load();
  const count = s.regs.filter(r => r.eid === e.id).length;
  const registered = e.base_registered + count;
  return {
    id: e.id, title: e.title, cat: e.cat, kind: e.kind, description: e.description, rules: e.rules,
    day: e.day, time: e.start_time, when: `Day ${e.day} · ${e.start_time}`, venue: e.venue, team: e.team,
    prize: e.prize, prizeAmount: e.prize_amount, capacity: e.capacity, registered,
    spotsLeft: Math.max(0, e.capacity - registered), tags: e.tags, twin: e.twin || '',
    isRegistered: !!uid && s.regs.some(r => r.uid === uid && r.eid === e.id)
  };
}
const listEvents = uid => EVENTS.map((e, i) => eventRow(e, i, uid));

function completeness(p) {
  const checks = [p.headline.length >= 8, p.bio.length >= 40, p.skills.length >= 3, p.projects.length >= 1, p.links.length >= 1, !!p.emoji];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function badgesFor(uid, profile) {
  const regs = load().regs.filter(r => r.uid === uid).map(r => EVENTS.find(e => e.id === r.eid)).filter(Boolean);
  const cats = new Set(regs.map(e => e.cat));
  const out = [];
  if (uid <= 12) out.push({ id: 'founder', label: 'Founding member', desc: 'One of the first twelve people to join.' });
  if (regs.length >= 1) out.push({ id: 'early', label: 'Registered', desc: 'Signed up for at least one event.' });
  if (regs.length >= 3) out.push({ id: 'hattrick', label: 'Hat-trick', desc: 'Registered for three or more events.' });
  if (regs.length >= 5) out.push({ id: 'completionist', label: 'Completionist', desc: 'Registered for five or more events.' });
  if (cats.size >= 3) out.push({ id: 'allrounder', label: 'All-rounder', desc: 'Events from three different categories.' });
  if (completeness(profile) >= 80) out.push({ id: 'pro', label: 'Profile pro', desc: 'Profile is at least 80% complete.' });
  return out;
}

function publicCard(uid) {
  const u = userById(uid), p = load().profiles[uid];
  return {
    handle: p.handle, name: u.name, college: u.college, headline: p.headline, accent: p.accent, emoji: p.emoji,
    initials: initials(u.name), skills: p.skills.slice(0, 5), eventCount: load().regs.filter(r => r.uid === uid).length
  };
}

function myProfile(uid) {
  const u = userById(uid), p = load().profiles[uid];
  return {
    user: { name: u.name, email: u.email, college: u.college, initials: initials(u.name), joined: u.created_at },
    profile: { ...p },
    completeness: completeness(p),
    badges: badgesFor(uid, p),
    registrations: listEvents(uid).filter(e => e.isRegistered)
  };
}

function requireUser() {
  const u = me();
  if (!u) throw new HttpError(401, 'Please log in first.');
  return u;
}

function addRegistrations(uid, ids) {
  const s = load();
  const unique = [...new Set(ids.map(i => clean(i, 20)))];
  for (const id of unique) if (!EVENTS.some(e => e.id === id)) throw new HttpError(400, 'Unknown event.');
  const fresh = unique.filter(id => !s.regs.some(r => r.uid === uid && r.eid === id));
  const seen = s.regs.filter(r => r.uid === uid).map(r => EVENTS.find(e => e.id === r.eid));
  for (const id of fresh) {
    const w = EVENTS.find(e => e.id === id);
    const c = seen.find(h => h.id !== w.id && h.day === w.day && h.start_time === w.start_time);
    if (c) throw new HttpError(409, `${w.title} clashes with ${c.title}. Both start on Day ${w.day} at ${w.start_time}.`);
    seen.push(w);
  }
  for (const id of fresh) {
    const e = EVENTS.find(x => x.id === id);
    if (e.base_registered + s.regs.filter(r => r.eid === id).length >= e.capacity) throw new HttpError(409, `${e.title} is full.`);
  }
  fresh.forEach(id => s.regs.push({ uid, eid: id, at: stamp() }));
  return fresh;
}

function makeHandle(name) {
  const base = (name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'user').slice(0, 14).padEnd(3, '0');
  const taken = h => Object.values(load().profiles).some(p => p.handle === h);
  let handle = base, n = 1;
  while (taken(handle)) handle = `${base}${++n}`;
  return handle;
}

const cleanLinks = v => (Array.isArray(v) ? v : []).slice(0, 6).map(l => ({ label: clean(l?.label, 24), url: clean(l?.url, 200) })).filter(l => l.label && /^https?:\/\/[^\s]+$/i.test(l.url));
const cleanSkills = v => [...new Set((Array.isArray(v) ? v : []).map(s => clean(s, 24)).filter(Boolean))].slice(0, 12);
const cleanProjects = v => (Array.isArray(v) ? v : []).slice(0, 6).map(p => ({
  title: clean(p?.title, 60),
  desc: clean(p?.desc, 240),
  url: /^https?:\/\/[^\s]+$/i.test(clean(p?.url, 200)) ? clean(p.url, 200) : '',
  tags: (Array.isArray(p?.tags) ? p.tags : []).map(t => clean(t, 20)).filter(Boolean).slice(0, 4)
})).filter(p => p.title);

function topScores(game) {
  const dir = GAMES[game] === 'asc' ? 1 : -1;
  return load().scores.map((r, i) => ({ ...r, i })).filter(r => r.game === game).sort((a, b) => (a.score - b.score) * dir || a.i - b.i).slice(0, 8).map(r => ({ name: r.name, score: r.score }));
}

function sessionPayload(u) {
  const p = load().profiles[u.id];
  return { user: { id: u.id, name: u.name, email: u.email, college: u.college }, handle: p.handle };
}

function route(method, path, query, body) {
  const s = load();
  const parts = path.split('/').filter(Boolean);
  const [a, b, c] = parts;
  const user = me();
  const literal = a === 'auth' || a === 'me';
  const key = literal ? `${method} /${a}/${b}` : `${method} /${a}${b ? '/:x' : ''}${c ? '/:y' : ''}`;

  switch (key) {
    case 'GET /site': {
      const colleges = new Set(s.users.map(u => u.college)).size;
      return { name: site.name, theme: site.theme, start: site.start, venue: site.venue, prizePool: site.prizePool, stats: { events: EVENTS.length, days: DAYS.length, participants: site.baseParticipants + s.users.length, colleges: colleges + 148, members: s.users.length } };
    }
    case 'GET /events': {
      const cat = clean(query.get('cat'), 30), q = clean(query.get('q'), 60).toLowerCase();
      let list = listEvents(user?.id);
      if (cat && cat !== 'All') list = list.filter(e => e.cat === cat);
      if (q) list = list.filter(e => `${e.title} ${e.kind} ${e.cat} ${e.tags.join(' ')}`.toLowerCase().includes(q));
      return { events: list, categories: ['All', ...new Set(EVENTS.map(e => e.cat))] };
    }
    case 'GET /events/:x': {
      const all = listEvents(user?.id);
      const idx = all.findIndex(e => e.id === b);
      if (idx < 0) throw new HttpError(404, 'Event not found.');
      const attendees = s.regs.filter(r => r.eid === b && s.profiles[r.uid].isPublic).sort((x, y) => (x.at < y.at ? 1 : -1)).slice(0, 12).map(r => publicCard(r.uid));
      const prev = all[(idx - 1 + all.length) % all.length], next = all[(idx + 1) % all.length];
      return { event: all[idx], attendees, prev: { id: prev.id, title: prev.title }, next: { id: next.id, title: next.title } };
    }
    case 'GET /schedule': {
      const mine = new Set(user ? s.regs.filter(r => r.uid === user.id).map(r => r.eid) : []);
      return {
        days: DAYS.map(d => ({
          day: d.day, label: d.label, date: d.date_label, theme: d.theme,
          slots: SLOTS.filter(x => x[0] === d.day).sort((x, y) => (x[1] < y[1] ? -1 : 1)).map(x => ({ time: x[1], title: x[2], venue: x[3], eventId: x[4], mine: !!x[4] && mine.has(x[4]) }))
        }))
      };
    }
    case 'GET /team': return { team: TEAM.map(t => ({ name: t[0], role: t[1], bio: t[2], initials: initials(t[0]) })) };
    case 'GET /sponsors': return { sponsors: SPONSORS.map(x => ({ name: x[0], tier: x[1] })) };
    case 'GET /faq': return { faq: FAQ.map(x => ({ q: x[0], a: x[1] })) };
    case 'POST /contact': {
      const name = clean(body.name, 80), email = clean(body.email, 120).toLowerCase(), text = clean(body.message, 1500);
      const fields = {};
      if (name.length < 2) fields.name = 'Please enter your name.';
      if (!EMAIL.test(email)) fields.email = 'Enter a valid email address.';
      if (text.length < 10) fields.message = 'Write at least a short sentence.';
      if (Object.keys(fields).length) throw new HttpError(400, 'Check the highlighted fields.', fields);
      s.messages.push({ name, email, body: text, at: stamp() });
      save();
      return { ok: true };
    }
    case 'GET /people': {
      const q = clean(query.get('q'), 40).toLowerCase(), skill = clean(query.get('skill'), 30).toLowerCase();
      let list = s.users.filter(u => s.profiles[u.id].isPublic).sort((x, y) => (s.profiles[x.id].updated < s.profiles[y.id].updated ? 1 : -1)).map(u => publicCard(u.id));
      const skills = [...new Set(list.flatMap(p => p.skills))].sort();
      if (q) list = list.filter(p => `${p.name} ${p.college} ${p.headline} ${p.handle}`.toLowerCase().includes(q));
      if (skill) list = list.filter(p => p.skills.some(x => x.toLowerCase() === skill));
      return { people: list, skills };
    }
    case 'GET /people/:x': {
      const uid = Number(Object.keys(s.profiles).find(k => s.profiles[k].handle === decodeURIComponent(b).toLowerCase()));
      if (!uid) throw new HttpError(404, 'No profile with that handle.');
      const p = s.profiles[uid], u = userById(uid);
      const isMe = user?.id === uid;
      if (!p.isPublic && !isMe) throw new HttpError(404, 'This profile is private.');
      const sec = p.sections;
      const all = listEvents();
      const evs = s.regs.filter(r => r.uid === uid).sort((x, y) => (x.at < y.at ? -1 : 1)).map(r => all.find(e => e.id === r.eid)).filter(Boolean);
      return {
        isMe,
        person: {
          handle: p.handle, name: u.name, college: u.college, initials: initials(u.name), headline: p.headline, bio: p.bio,
          accent: p.accent, theme: p.theme, layout: p.layout, cover: p.cover, emoji: p.emoji, skills: p.skills,
          links: sec.links ? p.links : [], projects: sec.projects ? p.projects : [],
          events: sec.events ? evs.map(e => ({ id: e.id, title: e.title, cat: e.cat, when: e.when })) : [],
          badges: sec.badges ? badgesFor(uid, p) : [], sections: sec, joined: u.created_at
        }
      };
    }
    case 'POST /auth/signup': {
      const name = clean(body.name, 60), email = clean(body.email, 120).toLowerCase(), college = clean(body.college, 80), password = String(body.password ?? '');
      const fields = {};
      if (name.length < 2) fields.name = 'Please enter your full name.';
      if (!EMAIL.test(email)) fields.email = 'Enter a valid email address.';
      if (college.length < 2) fields.college = 'Please enter your college.';
      if (password.length < 8) fields.password = 'Use at least 8 characters.';
      if (!fields.email && s.users.some(u => u.email === email)) fields.email = 'An account with this email already exists.';
      if (Object.keys(fields).length) throw new HttpError(400, 'Please fix the highlighted fields.', fields);
      const snapshot = JSON.stringify(s);
      try {
        const id = s.nextId++;
        s.users.push({ id, email, name, college, pw: hashPw(password), created_at: stamp() });
        s.profiles[id] = { handle: makeHandle(name), headline: '', bio: '', accent: '#C6FF3D', theme: 'dark', layout: 'cards', cover: 'mobius', emoji: '', links: [], skills: [], projects: [], sections: { events: true, badges: true, projects: true, links: true }, isPublic: true, updated: stamp() };
        addRegistrations(id, Array.isArray(body.eventIds) ? body.eventIds.slice(0, 8) : []);
        s.session = id;
        save();
        return sessionPayload(userById(id));
      } catch (e) {
        state = JSON.parse(snapshot);
        throw e;
      }
    }
    case 'POST /auth/login': {
      const email = clean(body.email, 120).toLowerCase(), password = String(body.password ?? '');
      const u = s.users.find(x => x.email === email);
      if (!u || u.pw !== hashPw(password)) throw new HttpError(401, 'Email or password is incorrect.');
      s.session = u.id;
      save();
      return sessionPayload(u);
    }
    case 'POST /auth/logout': s.session = null; save(); return { ok: true };
    case 'GET /auth/me': {
      if (!user) return { user: null };
      const p = s.profiles[user.id];
      return { user: { id: user.id, name: user.name, email: user.email, college: user.college, initials: initials(user.name) }, handle: p.handle, accent: p.accent, emoji: p.emoji };
    }
    case 'GET /me/registrations': { const u = requireUser(); return { events: listEvents(u.id).filter(e => e.isRegistered) }; }
    case 'POST /registrations': {
      const u = requireUser();
      const ids = Array.isArray(body.eventIds) ? body.eventIds.slice(0, 8) : [];
      if (!ids.length) throw new HttpError(400, 'Choose at least one event.');
      const added = addRegistrations(u.id, ids);
      save();
      return { added, events: listEvents(u.id).filter(e => e.isRegistered) };
    }
    case 'DELETE /registrations/:x': {
      const u = requireUser();
      const before = s.regs.length;
      s.regs = s.regs.filter(r => !(r.uid === u.id && r.eid === b));
      if (s.regs.length === before) throw new HttpError(404, 'You are not registered for that event.');
      save();
      return { ok: true };
    }
    case 'GET /me/profile': return myProfile(requireUser().id);
    case 'PUT /me/profile': {
      const u = requireUser();
      const fields = {};
      const handle = clean(body.handle, 20).toLowerCase();
      if (!HANDLE.test(handle)) fields.handle = 'Use 3 to 20 lowercase letters, numbers or underscores.';
      else if (Object.keys(s.profiles).some(k => Number(k) !== u.id && s.profiles[k].handle === handle)) fields.handle = 'That handle is taken.';
      const name = clean(body.name, 60);
      if (name.length < 2) fields.name = 'Please enter your name.';
      const college = clean(body.college, 80);
      if (college.length < 2) fields.college = 'Please enter your college.';
      if (!HEX.test(String(body.accent))) fields.accent = 'Pick a valid colour.';
      if (!THEMES.includes(body.theme)) fields.theme = 'Unknown theme.';
      if (!LAYOUTS.includes(body.layout)) fields.layout = 'Unknown layout.';
      if (!COVERS.includes(body.cover)) fields.cover = 'Unknown cover.';
      if (Object.keys(fields).length) throw new HttpError(400, 'Please fix the highlighted fields.', fields);
      const sec = body.sections || {};
      u.name = name;
      u.college = college;
      s.profiles[u.id] = {
        handle, headline: clean(body.headline, 90), bio: clean(body.bio, 500), accent: body.accent.toUpperCase(), theme: body.theme, layout: body.layout, cover: body.cover,
        emoji: clean(body.emoji, 8), links: cleanLinks(body.links), skills: cleanSkills(body.skills), projects: cleanProjects(body.projects),
        sections: { events: sec.events !== false, badges: sec.badges !== false, projects: sec.projects !== false, links: sec.links !== false },
        isPublic: body.isPublic !== false, updated: stamp()
      };
      save();
      return myProfile(u.id);
    }
    case 'POST /me/password': {
      const u = requireUser();
      if (u.pw !== hashPw(String(body.current ?? ''))) throw new HttpError(400, 'Current password is incorrect.', { current: 'Current password is incorrect.' });
      if (String(body.next ?? '').length < 8) throw new HttpError(400, 'Use at least 8 characters.', { next: 'Use at least 8 characters.' });
      u.pw = hashPw(String(body.next));
      save();
      return { ok: true };
    }
    case 'GET /scores/:x': {
      if (!GAMES[b]) throw new HttpError(404, 'Unknown game.');
      return { game: b, order: GAMES[b], scores: topScores(b) };
    }
    case 'POST /scores': {
      const game = clean(body.game, 20);
      if (!GAMES[game]) throw new HttpError(400, 'Unknown game.');
      const score = Math.round(Number(body.score));
      if (!Number.isFinite(score) || score < 0 || score > 10000000) throw new HttpError(400, 'Invalid score.');
      s.scores.push({ game, name: user ? user.name.split(' ')[0] : clean(body.name, 20) || 'Guest', score });
      save();
      return { ok: true, scores: topScores(game) };
    }
    default: throw new HttpError(404, 'Not found.');
  }
}

export function mockRequest(method, url, body) {
  const [path, qs] = url.split('?');
  try {
    return Promise.resolve(structuredClone(route(method, path, new URLSearchParams(qs || ''), body || {})));
  } catch (e) {
    if (e instanceof HttpError) return Promise.reject(e);
    return Promise.reject(new HttpError(500, 'Something went wrong. Please try again.'));
  }
}

export function resetDemoData() {
  state = seedState();
  save();
}
