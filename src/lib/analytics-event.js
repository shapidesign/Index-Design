const KINDS = new Set(['click', 'hover', 'share', 'forward']);

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
