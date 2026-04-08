import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (singleton pattern)
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Supabase] Missing env vars — running in mock mode');
      return null;
    }
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

// Server-side Supabase client (uses service role key)
export function getSupabaseServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.warn('[Supabase Server] Missing env vars — running in mock mode');
    return null;
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
