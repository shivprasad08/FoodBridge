import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import useRealtime from '../../hooks/useRealtime'
import TaskStatusTracker from '../../components/TaskStatusTracker'
import TaskStatusBar from '../../components/TaskStatusBar'
import StatusBadge from '../../components/StatusBadge'
import PageHeader from '../../components/PageHeader'
import SkeletonBox from '../../components/Skeleton'

const ListingDetail = () => {
  const { listingId } = useParams()
  const [listing, setListing] = useState(null)
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadListing = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const payload = await apiFetch(`/api/listings/${listingId}`)
      setListing(payload.data || null)
      setTask(payload.data?.task || null)
    } catch (err) {
      setError(err.message || 'Unable to load listing detail')
    } finally {
      setLoading(false)
    }
  }, [listingId])

  useEffect(() => {
    loadListing()
  }, [loadListing])

  useRealtime('tasks', 'UPDATE', (payload) => {
    if (payload.new?.food_listing_id === listingId || payload.new?.id === task?.id) {
      setTask(prev => ({ ...(prev || {}), ...payload.new }))
    }
  })

  useRealtime('food_listings', 'UPDATE', (payload) => {
    if (payload.new?.id === listingId) {
      setListing(prev => ({ ...(prev || {}), ...payload.new }))
    }
  })

  const status = task?.status || listing?.status || 'available'

  const action = useMemo(
    () => (
      <Link to="/provider/listings" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
        Back to Listings
      </Link>
    ),
    []
  )

  if (loading) {
    return (
      <section>
        <PageHeader title="Listing Detail" subtitle="Live task timeline" action={action} />
        <div className="space-y-4 px-4 py-4 md:px-6 md:py-6">
          <SkeletonBox className="h-24 w-full" />
          <SkeletonBox className="h-60 w-full" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <PageHeader title="Listing Detail" subtitle="Live task timeline" action={action} />
        <div className="px-4 py-4 md:px-6 md:py-6">
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        </div>
      </section>
    )
  }

  if (!listing) {
    return (
      <section>
        <PageHeader title="Listing Detail" subtitle="Live task timeline" action={action} />
        <div className="px-4 py-4 text-sm text-gray-500 md:px-6 md:py-6">Listing not found.</div>
      </section>
    )
  }

  return (
    <section>
      <PageHeader title={listing.title || 'Listing Detail'} subtitle="Track pickup and delivery updates in real time" action={action} />

      <div className="space-y-4 px-4 py-4 md:px-6 md:py-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">Task lifecycle</p>
            <StatusBadge status={status} />
          </div>
          <TaskStatusBar currentStatus={status} />
          <TaskStatusTracker task={{ ...(task || {}), status }} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Listing information</h2>
            <p className="mt-2 text-sm text-gray-600">{listing.food_type} - {listing.quantity}</p>
            <p className="mt-2 text-sm text-gray-600">Portions: {listing.quantity_number || 0}</p>
            <p className="mt-2 text-sm text-gray-600">Pickup: {listing.pickup_address || 'N/A'}</p>
            <p className="mt-2 text-sm text-gray-600">Expiry: {listing.expiry_time ? new Date(listing.expiry_time).toLocaleString() : 'N/A'}</p>
            <p className="mt-2 text-sm text-gray-600">NGO: {listing.ngo?.full_name || 'Not assigned yet'}</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <img
              src={listing.photo_url || 'https://placehold.co/900x520?text=Food+Listing'}
              alt={listing.title || 'Listing'}
              className="h-full min-h-72 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ListingDetail
