import { esc } from './core.js';
import { fmtDate } from './ui.js';

let uid = 0;

function cover(kind) {
  const id = `pf${++uid}`;
  const wrap = body => `<svg viewBox="0 0 800 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${body}</svg>`;
  if (kind === 'grid') return wrap(`<defs><pattern id="${id}" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" class="cv-a" stroke-width="1" opacity=".4"/></pattern></defs><rect width="800" height="220" fill="url(#${id})"/><circle cx="640" cy="80" r="70" class="cv-a" stroke-width="2" opacity=".7"/><circle cx="640" cy="80" r="36" class="cv-f" opacity=".25"/>`);
  if (kind === 'dots') return wrap(`<defs><pattern id="${id}" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="2.4" class="cv-f" opacity=".5"/></pattern></defs><rect width="800" height="220" fill="url(#${id})"/><circle cx="160" cy="150" r="90" class="cv-f" opacity=".14"/>`);
  if (kind === 'waves') return wrap([0, 1, 2, 3, 4].map(i => `<path d="M-20 ${60 + i * 28} C 120 ${20 + i * 28}, 240 ${110 + i * 28}, 400 ${60 + i * 28} S 680 ${10 + i * 28}, 820 ${60 + i * 28}" class="cv-a" stroke-width="2.5" opacity="${0.8 - i * 0.14}"/>`).join(''));
  return wrap(`<path d="M400 110 C 520 10, 720 10, 720 110 C 720 210, 520 210, 400 110 C 280 10, 80 10, 80 110 C 80 210, 280 210, 400 110 Z" class="cv-a" stroke-width="5"/><path d="M400 110 C 500 40, 660 40, 660 110 C 660 180, 500 180, 400 110 C 300 40, 140 40, 140 110 C 140 180, 300 180, 400 110 Z" class="cv-a" stroke-width="2" opacity=".45"/>`);
}

export function profileHTML(p) {
  const s = p.sections || { events: true, badges: true, projects: true, links: true };
  const tags = (p.skills || []).map(t => `<li class="pf__tag">${esc(t)}</li>`).join('');
  const links = (p.links || []).length && s.links !== false
    ? `<section><h2 class="pf__h">Links</h2><div class="pf__links">${p.links.map(l => `<a class="pf__link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div></section>` : '';
  const badges = (p.badges || []).length && s.badges !== false
    ? `<section><h2 class="pf__h">Badges</h2><div class="pf__badges">${p.badges.map(b => `<div class="pf__badge"><i aria-hidden="true">★</i><div><b>${esc(b.label)}</b><small>${esc(b.desc)}</small></div></div>`).join('')}</div></section>` : '';
  const events = (p.events || []).length && s.events !== false
    ? `<section><h2 class="pf__h">Registered events</h2><div class="pf__events">${p.events.map(e => `<a class="pf__ev" href="/events/${esc(e.id)}"><b>${esc(e.title)}</b><small>${esc(e.cat)} · ${esc(e.when)}</small></a>`).join('')}</div></section>` : '';
  const projects = (p.projects || []).length && s.projects !== false
    ? `<section><h2 class="pf__h">Projects</h2><div class="pf__projects">${p.projects.map(pr => {
      const inner = `<h3>${esc(pr.title)}</h3><p>${esc(pr.desc)}</p>${(pr.tags || []).length ? `<ul class="pf__tags">${pr.tags.map(t => `<li class="pf__tag">${esc(t)}</li>`).join('')}</ul>` : ''}`;
      return pr.url ? `<a class="pf__proj" href="${esc(pr.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : `<div class="pf__proj">${inner}</div>`;
    }).join('')}</div></section>` : '';
  const bio = p.bio ? `<p class="pf__bio">${esc(p.bio)}</p>` : '<p class="pf__bio" style="opacity:.5">No bio yet.</p>';
  return `<article class="pf pf--${esc(p.theme)} pf--${esc(p.layout)}" style="--pf-accent:${esc(p.accent)}">
    <div class="pf__cover" data-pf-cover>${cover(p.cover)}</div>
    <header class="pf__head">
      <div class="pf__av" data-pf-av aria-hidden="true">${p.emoji ? esc(p.emoji) : esc(p.initials)}</div>
      <div class="pf__id">
        <h1 class="pf__name">${esc(p.name)}</h1>
        ${p.headline ? `<p class="pf__headline">${esc(p.headline)}</p>` : ''}
        <p class="pf__meta">${esc(p.college)}${p.joined ? ` · Joined ${esc(fmtDate(p.joined))}` : ''}</p>
      </div>
    </header>
    <div class="pf__body" data-pf-body>
      <section>${bio}${tags ? `<ul class="pf__tags" style="margin-top:16px">${tags}</ul>` : ''}</section>
      ${links}${badges}${events}${projects}
    </div>
  </article>`;
}
