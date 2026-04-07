import { createClient } from '@supabase/supabase-js'

const neonUrl = import.meta.env.VITE_NEON_URL || import.meta.env.VITE_SUPABASE_URL
const neonAnonKey = import.meta.env.VITE_NEON_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const neon = createClient(
  neonUrl,
  neonAnonKey,
  {
    auth: {
      storage: window.sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)
