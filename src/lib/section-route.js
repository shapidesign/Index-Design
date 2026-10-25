/** Path routing for sections. Legacy `/#/toolbox` links rewrite to `/toolbox`. */

export function legacyHashToPath(hash) {
  const match = String(hash || '').match(/^#\/([a-z]+)(\?.*)?$/);
  return match ? `/${match[1]}${match[2] || ''}` : null;
}

export function sectionIdFromPathname(pathname, ids) {
  const id = String(pathname || '').split('/').filter(Boolean)[0] || '';
  return ids.includes(id) ? id : null;
}
