import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import useTask from '../../hooks/useTask'
import { calculateDistanceKm } from '../../utils/distanceUtils'
import ListingCard from '../../components/ListingCard'

const BrowseListings = () => {
  const { profile } = useAuth()
  const { claimTask } = useTask()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState('')
  const [error, setError] = useState('')

  const loadListings = async () => {
    try {
      setLoading(true)
      setError('')
      const payload = await apiFetch('/api/listings')
      const base = payload.data || []
      const withDistance = base.map(item => ({
        ...item,
        distance_km: calculateDistanceKm(
          profile?.lat,
          profile?.lng,
          item.pickup_lat,
          item.pickup_lng
        ),
      }))
      setListings(withDistance)
    } catch (err) {
      setError(err.message || 'Unable to load listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  const sorted = useMemo(() => {
    return [...listings].sort((a, b) => {
      if (a.distance_km === null) return 1
      if (b.distance_km === null) return -1
      return a.distance_km - b.distance_km
    })
  }, [listings])

  const handleClaim = async (listing) => {
    if (!listing?.task?.id) return
    try {
      setClaimingId(listing.id)
      await claimTask(listing.task.id)
      await loadListings()
    } catch (err) {
      setError(err.message || 'Claim failed')
    } finally {
      setClaimingId('')
    }
  }

  return (
    <section className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Available Food</h1>
        <p className="text-sm text-gray-600">Claim nearby listings and start pickup workflow.</p>
      </div>

      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading listings...</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-gray-500">No available listings right now.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map(item => (
            <ListingCard
              key={item.id}
              listing={item}
              claiming={claimingId === item.id}
              onClaim={handleClaim}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default BrowseListings
