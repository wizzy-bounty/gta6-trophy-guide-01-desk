// Platinum Desk — Leonida Trophy Command Center.
// One-screen GTA VI trophy guide & tracker: checklist, cited guide and
// platinum roadmap side by side. All data is local (data/trophies.json);
// progress lives in this browser's localStorage and nowhere else.

const DATA_URL = 'data/trophies.json';
const STORAGE_KEY = 'platinum-desk-progress-v1';
const RING_CIRCUMFERENCE = 169.6; // 2 * pi * 27, matches the SVG ring in index.html

const desk = {
  data: null,
  byId: new Map(),
  selectedId: null,
  filter: 'all',
  search: '',
  spoiler: false,
  hideEarned: false,
  progress: loadProgress(),
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: {}, counts: {} };
    const parsed = JSON.parse(raw);
    return { earned: parsed.earned || {}, counts: parsed.counts || {} };
  } catch {
    return { earned: {}, counts: {} };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(desk.progress));
}

function isEarned(id) {
  return Boolean(desk.progress.earned[id]);
}

function setEarned(id, on) {
  if (on) desk.progress.earned[id] = new Date().toISOString();
  else delete desk.progress.earned[id];
  saveProgress();
}

function getCount(trophy) {
  return desk.progress.counts[trophy.id] || 0;
}

function setCount(trophy, value) {
  const clean = Math.max(0, Math.floor(Number(value) || 0));
  desk.progress.counts[trophy.id] = clean;
  if (trophy.count && clean >= trophy.count.target) setEarned(trophy.id, true);
  saveProgress();
}

function isSpoilerHidden(trophy) {
  return desk.spoiler && trophy.kind === 'story' && !isEarned(trophy.id);
}

function displayName(trophy) {
  return isSpoilerHidden(trophy) ? 'Hidden story trophy' : trophy.name;
}

function earnedTotal() {
  return desk.data.trophies.filter((t) => isEarned(t.id)).length;
}

function visibleTrophies() {
  const q = desk.search.trim().toLowerCase();
  return desk.data.trophies.filter((t) => {
    if (desk.filter === 'missable' && !t.missable) return false;
    if (desk.filter !== 'all' && desk.filter !== 'missable' && t.kind !== desk.filter) return false;
    if (desk.hideEarned && isEarned(t.id)) return false;
    if (q && !displayName(t).toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
    return true;
  });
}

/* ---------------- checklist (left column) ---------------- */

function renderChecklist() {
  const list = document.getElementById('trophy-list');
  list.textContent = '';
  for (const trophy of visibleTrophies()) {
    const row = document.createElement('li');
    row.className = 'trophy-row' + (isEarned(trophy.id) ? ' is-earned' : '') + (trophy.id === desk.selectedId ? ' is-selected' : '');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned(trophy.id);
    box.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
    box.addEventListener('click', (ev) => ev.stopPropagation());
    box.addEventListener('change', () => { setEarned(trophy.id, box.checked); renderAll(); });

    const dot = document.createElement('span');
    dot.className = 'grade-dot grade-' + trophy.grade;

    const label = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'trophy-name' + (isSpoilerHidden(trophy) ? ' spoiler-blur' : '');
    name.textContent = displayName(trophy);
    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    meta.textContent = trophy.grade + ' · ' + trophy.kind + (trophy.hidden ? ' · hidden' : '');
    label.append(name, meta);

    const badge = document.createElement('span');
    if (trophy.missable) {
      badge.className = 'miss-flag';
      badge.textContent = '⚑';
      badge.title = 'Missable — see the guide before you pass its window';
    } else if (trophy.count) {
      badge.className = 'count-badge';
      badge.textContent = getCount(trophy) + '/' + trophy.count.target;
    }

    row.append(box, dot, label, badge);
    row.addEventListener('click', () => selectTrophy(trophy.id));
    list.append(row);
  }
  renderGradeSummary();
}

function renderGradeSummary() {
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const all = desk.data.trophies.filter((t) => t.grade === grade);
    const done = all.filter((t) => isEarned(t.id)).length;
    return done + '/' + all.length + ' ' + grade;
  });
  const shown = visibleTrophies().length;
  document.getElementById('grade-summary').textContent =
    parts.join(' · ') + ' — showing ' + shown + ' of 55';
}

/* ---------------- progress ring + audit strip ---------------- */

function roadmapHoursLeft() {
  let left = 0;
  for (const phase of desk.data.roadmap) {
    const total = phase.trophies.length;
    const done = phase.trophies.filter((id) => isEarned(id)).length;
    left += (phase.hours || 0) * ((total - done) / total);
  }
  return left;
}

function renderProgress() {
  const done = earnedTotal();
  const total = desk.data.trophies.length;
  const pct = Math.round((done / total) * 100);
  document.getElementById('progress-label').textContent = done + ' / ' + total;
  document.getElementById('progress-pct').textContent = pct + '% to platinum';
  document.getElementById('ring-value').style.strokeDashoffset =
    String(RING_CIRCUMFERENCE * (1 - done / total));
  document.getElementById('progress-bar-fill').style.width = pct + '%';
  document.getElementById('grade-counts').textContent =
    ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
      const all = desk.data.trophies.filter((t) => t.grade === grade);
      const got = all.filter((t) => isEarned(t.id)).length;
      return grade[0].toUpperCase() + grade.slice(1) + ' ' + got + '/' + all.length;
    }).join(' · ');
  const pace = document.getElementById('pace-line');
  if (done >= total) {
    pace.textContent = 'Platinum pace: 55/55 — platinum earned';
  } else {
    pace.textContent = 'Platinum pace: ' + done + '/' + total + ' earned · ' + (total - done) +
      ' to go · ≈' + Math.round(roadmapHoursLeft()) + ' h of roadmap left';
  }
}

function backedSteps(trophy) {
  return trophy.steps.filter((s) => s.s.length >= 2).length;
}

function renderAuditStrip() {
  const steps = desk.data.trophies.reduce((sum, t) => sum + t.steps.length, 0);
  const citations = desk.data.trophies.reduce((sum, t) => sum + t.sources.length, 0);
  const backed = desk.data.trophies.reduce((sum, t) => sum + backedSteps(t), 0);
  const missable = desk.data.trophies.filter((t) => t.missable).length;
  document.getElementById('audit-steps').textContent = steps + ' cited steps';
  document.getElementById('audit-citations').textContent = citations + ' citations';
  document.getElementById('audit-backed').textContent = backed + ' backed by 2+ sources';
  document.getElementById('audit-sources').textContent = desk.data.sources.length + ' dated sources';
  document.getElementById('audit-missable').textContent = missable + ' missable, flagged';
  document.getElementById('audit-detail').textContent =
    'Audit: ' + desk.data.trophies.length + ' of 55 trophies carry a full guide — ' +
    steps + ' steps carrying ' + citations + ' source citations to a dated matrix of ' +
    desk.data.sources.length + ' sources. Every step names the sources that back it, and a step ' +
    'confirmed by two or more sources carries a 2+ BACKED marker: ' + backed + ' of ' + steps +
    ' steps qualify. Guides are original to this entry; names and descriptions are the official ' +
    'list, as published by PlayStation and mirrored by Exophase, PSNProfiles, TrueTrophies, ' +
    'Push Square and PlayStation Lifestyle on 2026-11-18. Every citation under a guide is ' +
    'written out in full — source, what it supports, and its date — so it can be checked on its own.';
}

/* ---------------- guide panel (centre column) ---------------- */

function selectTrophy(id) {
  desk.selectedId = id;
  renderChecklist();
  renderGuide();
}

function renderGuide() {
  const trophy = desk.byId.get(desk.selectedId);
  const empty = document.getElementById('guide-empty');
  const content = document.getElementById('guide-content');
  if (!trophy) { empty.hidden = false; content.hidden = true; return; }
  empty.hidden = true;
  content.hidden = false;

  const gradeEl = document.getElementById('guide-grade');
  gradeEl.textContent = trophy.grade;
  gradeEl.className = 'grade-text-' + trophy.grade;
  document.getElementById('guide-kind').textContent =
    '· ' + trophy.kind + (trophy.hidden ? ' · hidden on PSN until earned' : '');
  document.getElementById('guide-flags').textContent = trophy.missable ? ' ⚑ MISSABLE' : '';

  const hiddenSpoiler = isSpoilerHidden(trophy);
  const nameEl = document.getElementById('guide-name');
  nameEl.textContent = displayName(trophy);
  nameEl.className = hiddenSpoiler ? 'spoiler-blur' : '';
  const officialEl = document.getElementById('guide-official');
  officialEl.textContent = '“' + trophy.description + '” — official description (PlayStation Network trophy service)';
  officialEl.className = hiddenSpoiler ? 'spoiler-blur' : '';

  document.getElementById('guide-where').textContent = trophy.where;
  const miss = document.getElementById('guide-miss');
  miss.textContent = trophy.missWindow;
  miss.className = trophy.missable ? '' : 'is-safe';
  document.getElementById('guide-prose').textContent = trophy.guide;

  document.getElementById('guide-steps-heading').textContent =
    'Steps — ' + trophy.steps.length + ' cited · ' + backedSteps(trophy) + ' backed by 2+ sources';
  const stepsEl = document.getElementById('guide-steps');
  stepsEl.textContent = '';
  for (const step of trophy.steps) {
    const li = document.createElement('li');
    li.className = 'step';
    const text = document.createElement('span');
    text.className = 'step-text';
    text.textContent = step.t;
    li.append(text);
    const chips = document.createElement('span');
    chips.className = 'step-chips';
    for (const sid of step.s) {
      const chip = document.createElement('span');
      chip.className = 'src-chip';
      chip.textContent = sid;
      const src = desk.data.sources.find((s) => s.id === sid);
      if (src) chip.title = src.name + ' (' + src.date + ')';
      chips.append(chip);
    }
    if (step.s.length >= 2) {
      const badge = document.createElement('span');
      badge.className = 'backed-badge';
      badge.textContent = '2+ BACKED';
      chips.append(badge);
    }
    li.append(chips);
    stepsEl.append(li);
  }

  const counter = document.getElementById('guide-counter');
  if (trophy.count) {
    counter.hidden = false;
    document.getElementById('counter-label').textContent = 'Your count:';
    document.getElementById('counter-input').value = getCount(trophy);
    document.getElementById('counter-target').textContent =
      'of ' + trophy.count.target + ' ' + trophy.count.unit;
  } else {
    counter.hidden = true;
  }

  const sourcesEl = document.getElementById('guide-sources');
  sourcesEl.textContent = '';
  for (const citation of trophy.sources) {
    const line = document.createElement('span');
    line.className = 'citation';
    line.textContent = citation;
    sourcesEl.append(line);
  }

  const earnBtn = document.getElementById('guide-earn-toggle');
  earnBtn.textContent = isEarned(trophy.id) ? 'Earned ✓ (click to undo)' : 'Mark as earned';
  earnBtn.className = isEarned(trophy.id) ? 'is-earned' : '';
}

/* ---------------- roadmap + sources (right column) ---------------- */

function renderRoadmap() {
  const list = document.getElementById('roadmap-list');
  list.textContent = '';
  for (const phase of desk.data.roadmap) {
    const item = document.createElement('li');
    item.className = 'roadmap-phase';
    const title = document.createElement('p');
    title.className = 'roadmap-phase-title';
    const no = document.createElement('span');
    no.className = 'phase-no';
    no.textContent = 'Phase ' + phase.phase + ' — ';
    title.append(no, document.createTextNode(phase.title + (phase.hours ? ' · ≈' + phase.hours + ' h' : '')));
    const note = document.createElement('p');
    note.className = 'roadmap-note';
    note.textContent = phase.note;
    const trophies = document.createElement('ul');
    trophies.className = 'roadmap-trophies';
    for (const id of phase.trophies) {
      const trophy = desk.byId.get(id);
      const li = document.createElement('li');
      li.textContent = (trophy.missable ? '⚑ ' : '') + displayName(trophy);
      if (isEarned(id)) li.className = 'is-earned';
      li.addEventListener('click', () => selectTrophy(id));
      trophies.append(li);
    }
    item.append(title, note, trophies);
    list.append(item);
  }
}

function renderSources() {
  const list = document.getElementById('source-list');
  list.textContent = '';
  for (const source of desk.data.sources) {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.className = 'source-name';
    name.textContent = source.id + ' · ' + source.name;
    li.append(name, document.createTextNode(' — ' + source.detail + ' (' + source.date + ')'));
    if (source.url) {
      const url = document.createElement('span');
      url.className = 'source-url';
      url.textContent = source.url;
      li.append(document.createElement('br'), url);
    }
    list.append(li);
  }
}

/* ---------------- export / import / reset ---------------- */

function exportProgress() {
  const blob = new Blob([JSON.stringify(desk.progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'platinum-desk-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  file.text().then((text) => {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) return;
      desk.progress = { earned: parsed.earned || {}, counts: parsed.counts || {} };
      saveProgress();
      renderAll();
    } catch { /* a bad file changes nothing */ }
  });
}

function resetProgress() {
  desk.progress = { earned: {}, counts: {} };
  saveProgress();
  renderAll();
}

/* ---------------- wiring ---------------- */

function renderAll() {
  renderChecklist();
  renderGuide();
  renderRoadmap();
  renderProgress();
}

function applyUrlState() {
  const params = new URLSearchParams(location.search);
  const filter = params.get('filter');
  if (filter) {
    desk.filter = filter;
    document.querySelectorAll('.chip').forEach((chip) =>
      chip.classList.toggle('is-active', chip.dataset.filter === filter));
  }
  if (params.get('spoiler') === '1') {
    desk.spoiler = true;
    document.getElementById('spoiler-toggle').checked = true;
  }
  const earned = params.get('earned');
  if (earned) {
    for (const part of earned.split(',')) {
      const id = Number(part);
      if (desk.byId.has(id)) desk.progress.earned[id] = new Date().toISOString();
    }
    saveProgress();
  }
  const counts = params.get('counts');
  if (counts) {
    for (const pair of counts.split(',')) {
      const [id, n] = pair.split(':').map(Number);
      if (desk.byId.has(id)) desk.progress.counts[id] = n;
    }
    saveProgress();
  }
  const t = Number(params.get('t'));
  if (desk.byId.has(t)) desk.selectedId = t;
}

function wireControls() {
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      desk.filter = chip.dataset.filter;
      document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c === chip));
      renderChecklist();
    });
  });
  document.getElementById('search-box').addEventListener('input', (ev) => {
    desk.search = ev.target.value;
    renderChecklist();
  });
  document.getElementById('spoiler-toggle').addEventListener('change', (ev) => {
    desk.spoiler = ev.target.checked;
    renderAll();
  });
  document.getElementById('hide-earned-toggle').addEventListener('change', (ev) => {
    desk.hideEarned = ev.target.checked;
    renderChecklist();
  });
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  const fileInput = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) importProgress(fileInput.files[0]); });
  document.getElementById('reset-btn').addEventListener('click', resetProgress);
  document.getElementById('guide-earn-toggle').addEventListener('click', () => {
    const trophy = desk.byId.get(desk.selectedId);
    if (trophy) { setEarned(trophy.id, !isEarned(trophy.id)); renderAll(); }
  });
  document.getElementById('counter-minus').addEventListener('click', () => {
    const trophy = desk.byId.get(desk.selectedId);
    if (trophy) { setCount(trophy, getCount(trophy) - 1); renderAll(); }
  });
  document.getElementById('counter-plus').addEventListener('click', () => {
    const trophy = desk.byId.get(desk.selectedId);
    if (trophy) { setCount(trophy, getCount(trophy) + 1); renderAll(); }
  });
  document.getElementById('counter-input').addEventListener('change', (ev) => {
    const trophy = desk.byId.get(desk.selectedId);
    if (trophy) { setCount(trophy, ev.target.value); renderAll(); }
  });
}

async function init() {
  const res = await fetch(DATA_URL);
  desk.data = await res.json();
  desk.byId = new Map(desk.data.trophies.map((t) => [t.id, t]));
  applyUrlState();
  if (!desk.selectedId) desk.selectedId = 37; // open on a missable guide: the desk's point, at a glance
  wireControls();
  renderAuditStrip();
  renderSources();
  renderAll();
}

init();
