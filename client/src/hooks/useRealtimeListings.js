import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import useRealtime from './useRealtime'

// ---------------------------------------------
// useRealtimeListings
// Fetches available listings and subscribes to
// real-time updates so the NGO browse screen
// updates instantly when a listing is claimed
// or a new one is posted nearby.
// ---------------------------------------------
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

    try {
      const payload = await apiFetch('/api/listings')
      setListings(payload.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load listings')
    }

    setLoading(false)
  }

  // Real-time: new listing inserted -> refresh list
  useRealtime('food_listings', 'INSERT', () => {
    fetchListings()
  })

  // Real-time: listing updated (e.g. status -> claimed)
  // Update or remove from available list
  useRealtime('food_listings', 'UPDATE', (payload) => {
    setListings(prev =>
      prev
        .map(l => (l.id === payload.new.id ? { ...l, ...payload.new } : l))
        .filter(l => l.status === 'available')
    )
  })

  return { listings, loading, error, refetch: fetchListings, setListings }
}

export default useRealtimeListings
