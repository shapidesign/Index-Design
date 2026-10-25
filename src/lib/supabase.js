import { createClient } from '@supabase/supabase-js';
import { currentAppUrl } from './auth-redirect.js';

// Publishable key is public; Postgres Row Level Security (RLS) enforces per-user access control.
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const SUPABASE_URL =
  env.VITE_SUPABASE_URL || 'https://eagvurbzbpehksxmzzbq.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hbUv81Kv-M6qs1MRXtip-w_azXeUTZ_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined',
  },
});

/** Open Google's account picker. The browser leaves this page. */
export async function signInWithGoogle() {
  const redirectTo = typeof window === 'undefined' ? undefined : currentAppUrl(window.location);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
  return data;
}

export default supabase;
