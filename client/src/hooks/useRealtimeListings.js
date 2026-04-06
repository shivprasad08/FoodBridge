import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import useRealtime from './useRealtime'

// ─────────────────────────────────────────────
// useRealtimeListings
// Fetches available listings and subscribes to
// real-time updates so the NGO browse screen
// updates instantly when a listing is claimed
// or a new one is posted nearby.
// ─────────────────────────────────────────────
const useRealtimeListings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('food_listings')
      .select(`
        *,
        provider:provider_id (
          id, full_name, phone, address
        ),
        tasks (
          id, status, ngo_id, claimed_at
        )
      `)
      .eq('status', 'available')
      .gt('expiry_time', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setListings(data || [])
    }
    setLoading(false)
  }

  // Real-time: new listing inserted → add to top of list
  useRealtime('food_listings', 'INSERT', (payload) => {
    if (payload.new.status === 'available') {
      setListings(prev => [payload.new, ...prev])
    }
  })

  // Real-time: listing updated (e.g. status → claimed)
  // → update or remove from available list
  useRealtime('food_listings', 'UPDATE', (payload) => {
    setListings(prev =>
      prev.map(l =>
        l.id === payload.new.id ? payload.new : l
      ).filter(l => l.status === 'available')
    )
  })

  return { listings, loading, error, refetch: fetchListings }
}

export default useRealtimeListings
