import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;

const supabaseUrl =
  metaEnv?.VITE_SUPABASE_URL ||
  metaEnv?.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined) ||
  'https://vxmvnnbzffzmoilyvpgi.supabase.co';

const supabaseKey =
  metaEnv?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  metaEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY : undefined) ||
  'sb_publishable_Ou0GNF9Jw6kBZNLqKAoN0A_flk_75nX';

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey);
};

export const supabase = createClient();
