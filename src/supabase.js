import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const isValidUrl = (url) => {
  try {
    return url && url.startsWith('http') && !url.includes('your-supabase-project.supabase.co');
  } catch (e) {
    return false;
  }
};

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey && supabaseAnonKey !== 'your-public-anon-key';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
