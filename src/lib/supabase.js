import { createClient } from '@supabase/supabase-js';

// Publishable key is public; Postgres Row Level Security (RLS) enforces per-user access control.
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const SUPABASE_URL =
  env.VITE_SUPABASE_URL || 'https://eagvurbzbpehksxmzzbq.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hbUv81Kv-M6qs1MRXtip-w_azXeUTZ_';

export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined',
  },
});

export async function fetchWhatsNew() {
  const { data, error } = await supabase
    .from('whats_new')
    .select('version,title,items,enabled')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data || !Array.isArray(data.items)) return null;
  return data;
}

export default supabase;
