export function isAdminRoute(loc) {
  const here = loc || (typeof window !== 'undefined' ? window.location : { pathname: '/', hash: '' });
  const path = String(here.pathname || '/').replace(/\/+$/, '') || '/';
  return path === '/admin' || String(here.hash || '').startsWith('#/admin');
}
