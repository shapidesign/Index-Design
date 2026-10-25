/** Path routing for sections. Legacy `/#/toolbox` links rewrite to `/toolbox`. */

export function legacyHashToPath(hash) {
  const match = String(hash || '').match(/^#\/([a-z]+)(\?.*)?$/);
  return match ? `/${match[1]}${match[2] || ''}` : null;
}

export function sectionIdFromPathname(pathname, ids) {
  const id = String(pathname || '').split('/').filter(Boolean)[0] || '';
  return ids.includes(id) ? id : null;
}

// Keyboard stays unmounted: its key listener calls preventDefault on Space.
const KEEP_WARM = new Set(['toolbox', 'dictionary', 'museum', 'library', 'tips', 'map', 'saved']);

/** Keep a visited section in the DOM so leaving /saved does not remount it. */
export function sectionStaysMounted(id, activeId, seen) {
  if (activeId === id) return true;
  return KEEP_WARM.has(id) && seen?.[id] === true;
}
