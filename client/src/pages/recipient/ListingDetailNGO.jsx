import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useTask from '../../hooks/useTask'
import { apiFetch } from '../../lib/api'
import { Map, MapMarker, MarkerContent } from '../../components/ui/map'
import { Card } from '../../components/ui/card'
import StatusBadge from '../../components/StatusBadge'

const ListingDetailNGO = () => {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { claimTask } = useTask()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const payload = await apiFetch(`/api/listings/${listingId}`)
        setListing(payload.data)
      } catch (err) {
        setError(err.message || 'Unable to load listing')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [listingId])

  const handleClaim = async () => {
    if (!listing?.task?.id) return
    try {
      setClaiming(true)
      await claimTask(listing.task.id)
      navigate('/recipient/pickups')
    } catch (err) {
      setError(err.message || 'Unable to claim')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) return <section className="p-6 text-sm text-gray-500">Loading listing...</section>
  if (!listing) return <section className="p-6 text-sm text-red-600">Listing not found.</section>

  return (
    <section className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link to="/recipient/browse" className="text-sm text-emerald-700 hover:underline">Back to browse</Link>
        <StatusBadge status={listing?.task?.status || listing?.status} />
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <img
            src={listing.photo_url || 'https://placehold.co/800x420?text=Food+Listing'}
            alt={listing.title}
            className="h-64 w-full rounded-2xl object-cover"
          />
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
            <p className="mt-2 text-sm text-gray-600">{listing.food_type} • {listing.quantity} ({listing.quantity_number} portions)</p>
            <p className="mt-3 text-sm text-gray-700">{listing.notes || 'No additional notes provided.'}</p>
            <p className="mt-4 text-sm text-gray-600"><span className="font-semibold text-gray-900">Pickup:</span> {listing.pickup_address}</p>
            <p className="mt-1 text-sm text-gray-600"><span className="font-semibold text-gray-900">Provider:</span> {listing.provider?.full_name} ({listing.provider?.phone || 'No phone'})</p>

            <button
              type="button"
              onClick={handleClaim}
              disabled={claiming || listing?.task?.status !== 'available'}
              className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {claiming ? 'Claiming...' : 'Claim This Listing'}
            </button>
          </div>
        </div>

        <Card className="h-[400px] overflow-hidden p-0">
          <Map
            viewport={{ center: [listing.pickup_lng || 73.7997, listing.pickup_lat || 18.6298], zoom: 14 }}
            loading={false}
          >
            <MapMarker longitude={listing.pickup_lng || 73.7997} latitude={listing.pickup_lat || 18.6298}>
              <MarkerContent />
            </MapMarker>
          </Map>
        </Card>
      </div>
    </section>
  )
}

export default ListingDetailNGO
