import { createClient } from '@supabase/supabase-js'

const neonUrl = import.meta.env.VITE_NEON_URL || import.meta.env.VITE_SUPABASE_URL
const neonAnonKey = import.meta.env.VITE_NEON_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

const createNoopRealtimeClient = () => ({
  channel: () => ({
    on() {
      return this
    },
    subscribe() {
      return null
    },
  }),
  removeChannel: () => null,
})

export const neon =
  neonUrl && neonAnonKey
    ? createClient(
        neonUrl,
        neonAnonKey,
        {
          auth: {
            storage: window.sessionStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        }
      )
    : createNoopRealtimeClient()

if (!neonUrl || !neonAnonKey) {
  console.error(
    '[Config] Missing Neon client env vars. Set VITE_NEON_URL and VITE_NEON_ANON_KEY in Vercel project settings.'
  )
}
