/** URL helpers for Supabase Auth redirects. Kept free of the client so tests can import them. */

export function currentAppUrl(loc) {
  return `${loc.origin}${loc.pathname}${loc.search}`;
}

/** True while a Supabase OAuth callback is still in the address bar. */
export function hasAuthCallback(loc) {
  const params = new URLSearchParams(loc.search || '');
  if (params.has('code') || params.has('error') || params.has('error_description')) return true;
  const hash = String(loc.hash || '');
  return (
    hash.includes('access_token=') ||
    hash.includes('refresh_token=') ||
    hash.includes('error_description=')
  );
}
