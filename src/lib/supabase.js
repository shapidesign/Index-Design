import { createClient } from '@supabase/supabase-js';

// Publishable key is public; Postgres Row Level Security (RLS) enforces per-user access control.
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const SUPABASE_URL =
  env.VITE_SUPABASE_URL || 'https://eagvurbzbpehksxmzzbq.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hbUv81Kv-M6qs1MRXtip-w_azXeUTZ_';

export const GOOGLE_CLIENT_ID =
  env.VITE_GOOGLE_CLIENT_ID ||
  '15805305367-4lb00vc0qeb11ci44srln4ia20gu5kek.apps.googleusercontent.com';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined',
  },
});

export default supabase;
