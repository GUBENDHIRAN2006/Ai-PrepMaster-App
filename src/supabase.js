import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const SUPABASE_URL = 'https://vzvsovwzyfqzimwwaipy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XNGuxmAydpjNXJqZafO5dg_bRhtdzd7';

// Create and export the Supabase client
// This client is used by the frontend for any direct Supabase queries (e.g. real-time subscriptions)
// Authentication & main data operations go through the FastAPI backend
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // We manage auth via our own JWT (FastAPI backend)
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
