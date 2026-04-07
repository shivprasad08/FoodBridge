import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useTask from '../../hooks/useTask'
import useRealtimeListings from '../../hooks/useRealtimeListings'
import { calculateDistanceKm } from '../../utils/distanceUtils'
import ListingCard from '../../components/ListingCard'
import PageHeader from '../../components/PageHeader'
import { ListingCardSkeleton } from '../../components/Skeleton'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../context/ToastContext'

const BrowseListings = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { claimTask } = useTask()
  const { listings, loading, error, setListings, refetch } = useRealtimeListings()
  const { toast } = useToast()
  const [claimingId, setClaimingId] = useState('')

  const sorted = useMemo(() => {
    const withDistance = (listings || []).map(item => ({
      ...item,
      distance_km: calculateDistanceKm(
        profile?.lat,
        profile?.lng,
        item.pickup_lat,
        item.pickup_lng
      ),
    }))

    const activeListings = withDistance.filter(item => (
      item.status === 'available' && new Date(item.expiry_time) > new Date()
    ))

    return activeListings.sort((a, b) => {
      if (a.distance_km === null) return 1
      if (b.distance_km === null) return -1
      return a.distance_km - b.distance_km
    })
  }, [listings, profile?.lat, profile?.lng])

  const handleClaim = async (listing) => {
    if (!listing?.task?.id) return
    try {
      setClaimingId(listing.id)
      await claimTask(listing.task.id)
      toast.success('Food claimed successfully! Head to My Pickups.')
      await refetch()
      navigate('/recipient/pickups')
    } catch (err) {
      const message = err.message || 'Claim failed'
      if (/already claimed/i.test(message)) {
        toast.error('Already claimed!')
      } else {
        toast.error(message)
      }
    } finally {
      setClaimingId('')
    }
  }

  const handleListingExpired = (listingId) => {
    setListings(prev => prev.filter(item => item.id !== listingId))
  }

  return (
    <section>
      <PageHeader title="Browse Available Food" subtitle="Claim nearby listings and start pickup workflow" />

      <div className="px-4 py-4 md:px-6 md:py-6">
        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(4)].map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon="Meal"
            title="No food available right now"
            description="Check back soon. Providers near you will post when they have surplus food."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map(item => (
              <ListingCard
                key={item.id}
                listing={item}
                claiming={claimingId === item.id}
                onClaim={handleClaim}
                onExpired={handleListingExpired}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default BrowseListings
