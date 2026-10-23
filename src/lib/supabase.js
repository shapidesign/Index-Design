import { createClient } from '@supabase/supabase-js';

// Publishable key is public. RLS is the access control.
// Override with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY if the key is rotated.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://eagvurbzbpehksxmzzbq.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hbUv81Kv-M6qs1MRXtip-w_azXeUTZ_';

export const supabase = createClient(url, key);

export async function fetchWhatsNew() {
  const { data, error } = await supabase
    .from('whats_new')
    .select('version,title,items,enabled')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data || !Array.isArray(data.items)) return null;
  return data;
}
