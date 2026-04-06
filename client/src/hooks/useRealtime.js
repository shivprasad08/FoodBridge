import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

// ─────────────────────────────────────────────
// useRealtime
// Subscribes to Postgres changes on a given table
// and calls the callback when a change arrives.
//
// Usage:
// useRealtime('notifications', 'INSERT',
//   (payload) => setNotifications(prev => [payload.new, ...prev]),
//   { column: 'user_id', value: user.id }
// )
// ─────────────────────────────────────────────
const useRealtime = (table, event, callback, filter = null) => {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    let channelConfig = {
      event,
      schema: 'public',
      table,
    }

    // Optional row-level filter e.g. user_id=eq.some-uuid
    if (filter) {
      channelConfig.filter =
        `${filter.column}=eq.${filter.value}`
    }

    const channel = supabase
      .channel(`realtime-${table}-${event}-${Date.now()}`)
      .on('postgres_changes', channelConfig, (payload) => {
        callbackRef.current(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event, filter?.value])
}

export default useRealtime
