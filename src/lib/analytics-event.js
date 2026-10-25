const KINDS = new Set(['click', 'hover', 'share', 'forward', 'view']);

export const HEAT_COLS = 10;
export const HEAT_ROWS = 16;

export function clamp(n, min, max) {
  const value = Number.isFinite(n) ? n : min;
  return Math.min(max, Math.max(min, value));
}

function clean(value, max) {
  const text = String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
  return text || null;
}

export function pagePercent(pageX, pageY, width, height) {
  const w = Math.max(1, Number(width) || 1);
  const h = Math.max(1, Number(height) || 1);
  return {
    x: clamp(Math.round((Number(pageX) / w) * 100), 0, 100),
    y: clamp(Math.round((Number(pageY) / h) * 100), 0, 100),
  };
}

export function buildAnalyticsEvent(input) {
  if (!input || !KINDS.has(input.kind)) return null;
  const event = {
    kind: input.kind,
    path: clean(input.path, 200) || '/',
    section: clean(input.section, 40) || 'home',
    label: clean(input.label, 80),
  };
  if (input.x != null || input.y != null) {
    event.x = clamp(Math.round(Number(input.x)), 0, 100);
    event.y = clamp(Math.round(Number(input.y)), 0, 100);
  }
  return event;
}

/** Subpage id from a stored path. Hash routes and `/saved` recorded as home still count. */
export function pageOf(event) {
  const path = String(event?.path || '');
  const id = path.match(/#\/([a-z]+)/)?.[1]
    || path.match(/^\/([a-z]+)\/?$/)?.[1]
    || event?.section
    || 'home';
  if (!id || id === 'admin' || id === 'privacy' || id === 'terms') return 'home';
  return id;
}

/** Button name worth ranking. Background, fields, and typed emails are not buttons. */
export function buttonLabel(label) {
  const text = String(label || '').replace(/\s+/g, ' ').trim();
  if (!text || text === 'רקע' || text === 'שדה') return null;
  if (text.includes('@') || /^[•*.\s]+$/.test(text)) return null;
  return text;
}

/** Highest counts first. Ties break on the Hebrew label so the order stays stable. */
export function rankCounts(rows, keyOf, limit = 8) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), 'he'))
    .slice(0, limit);
}

export function checkAnalyticsRanks() {
  if (pageOf({ path: '/saved', section: 'home' }) !== 'saved') throw new Error('saved path');
  if (pageOf({ path: '/#/toolbox', section: 'home' }) !== 'toolbox') throw new Error('hash path');
  if (pageOf({ path: '/', section: 'home' }) !== 'home') throw new Error('home');
  if (buttonLabel('רקע') !== null || buttonLabel('a@b.com') !== null) throw new Error('noise');
  if (buttonLabel('מצב כהה') !== 'מצב כהה') throw new Error('button');
  const ranked = rankCounts([{ kind: 'click' }, { kind: 'click' }, { kind: 'view' }], (row) => row.kind);
  if (ranked[0][0] !== 'click' || ranked[0][1] !== 2 || ranked[1][0] !== 'view') throw new Error('rank');
}

/** Coarse page map. x/y are 0–100 across the document, not a screenshot overlay. */
export function binHeat(points, cols = HEAT_COLS, rows = HEAT_ROWS) {
  const cells = new Array(cols * rows).fill(0);
  for (const point of points) {
    if (point?.x == null || point?.y == null) continue;
    const x = clamp(Number(point.x), 0, 100);
    const y = clamp(Number(point.y), 0, 100);
    const col = Math.min(cols - 1, Math.floor(x / (100 / cols)));
    const row = Math.min(rows - 1, Math.floor(y / (100 / rows)));
    cells[row * cols + col] += 1;
  }
  return cells;
}
