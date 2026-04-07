import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import useRealtime from '../../hooks/useRealtime'
import TaskStatusTracker from '../../components/TaskStatusTracker'
import TaskStatusBar from '../../components/TaskStatusBar'
import StatusBadge from '../../components/StatusBadge'
import PageHeader from '../../components/PageHeader'
import SkeletonBox from '../../components/Skeleton'
import { Map, MapControls, MapMarker, MarkerContent, MarkerLabel, MarkerPopup } from '../../components/ui/map'

const mapStyles = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

const ListingDetail = () => {
  const { listingId } = useParams()
  const [listing, setListing] = useState(null)
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pickupLat, setPickupLat] = useState(18.6298)
  const [pickupLng, setPickupLng] = useState(73.7997)

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

  useEffect(() => {
    if (!listing) return

    const rawLat = listing.pickup_lat ?? listing.lat
    const rawLng = listing.pickup_lng ?? listing.lng
    const lat = rawLat === null || rawLat === undefined || rawLat === '' ? NaN : Number(rawLat)
    const lng = rawLng === null || rawLng === undefined || rawLng === '' ? NaN : Number(rawLng)

    const isLatValid = Number.isFinite(lat) && Math.abs(lat) <= 90
    const isLngValid = Number.isFinite(lng) && Math.abs(lng) <= 180

    if (isLatValid && isLngValid) {
      setPickupLat(lat)
      setPickupLng(lng)
      return
    }

    // Handle historical rows where latitude/longitude were stored in swapped columns.
    const canSwap = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lng) <= 90 && Math.abs(lat) <= 180
    if (canSwap) {
      setPickupLat(lng)
      setPickupLng(lat)
      return
    }

    const address = listing.pickup_address?.trim()
    if (!address) return

    let active = true
    const geocode = async () => {
      try {
        const searchParams = new URLSearchParams({
          format: 'jsonv2',
          limit: '1',
          q: address,
        })

        const response = await fetch(`https://nominatim.openstreetmap.org/search?${searchParams.toString()}`, {
          headers: { Accept: 'application/json' },
        })
        const results = await response.json()
        if (!active || !Array.isArray(results) || results.length === 0) return

        const nextLat = Number(results[0].lat)
        const nextLng = Number(results[0].lon)
        if (Number.isFinite(nextLat) && Number.isFinite(nextLng) && Math.abs(nextLat) <= 90 && Math.abs(nextLng) <= 180) {
          setPickupLat(nextLat)
          setPickupLng(nextLng)
        }
      } catch {
        // Keep default map center if geocoding fails.
      }
    }

    geocode()
    return () => {
      active = false
    }
  }, [listing])

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
            <Map
              theme="light"
              styles={{ light: mapStyles, dark: mapStyles }}
              viewport={{ center: [pickupLng || 73.7997, pickupLat || 18.6298], zoom: 14 }}
              loading={false}
              className="h-full min-h-72 w-full"
            >
              <MapControls position="bottom-right" showZoom />

              <MapMarker longitude={pickupLng || 73.7997} latitude={pickupLat || 18.6298}>
                <MarkerContent>
                  <div className="relative h-5 w-5 rounded-full border-2 border-white bg-blue-500 shadow">
                    <div className="absolute -inset-1 rounded-full border border-blue-300/70" />
                  </div>
                  <MarkerLabel position="top">Pickup</MarkerLabel>
                </MarkerContent>
                <MarkerPopup>
                  <div className="text-xs text-gray-700">
                    <p className="font-semibold text-gray-900">Pickup location</p>
                    <p>{listing.pickup_address || 'Address unavailable'}</p>
                    <p>Lat: {Number(pickupLat || 0).toFixed(6)}</p>
                    <p>Lng: {Number(pickupLng || 0).toFixed(6)}</p>
                  </div>
                </MarkerPopup>
              </MapMarker>
            </Map>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ListingDetail
