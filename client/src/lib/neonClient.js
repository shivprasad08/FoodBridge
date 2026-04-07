import { createClient } from '@supabase/supabase-js'

export const neon = createClient(
  import.meta.env.VITE_NEON_URL,
  import.meta.env.VITE_NEON_ANON_KEY,
  {
    auth: {
      storage: window.sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)
