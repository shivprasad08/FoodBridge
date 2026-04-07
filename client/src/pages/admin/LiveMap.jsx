import { useEffect, useMemo, useRef, useState } from 'react'
import useRealtime from '../../hooks/useRealtime'
import useAdminData from '../../hooks/useAdminData'

const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
]

const LiveMap = () => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const listingMarkers = useRef({})
  const ngoMarkers = useRef({})
  const [listings, setListings] = useState([])
  const [ngos, setNgos] = useState([])
  const { refetchListings, refetchUsers, users, listings: allListings } = useAdminData()

  const hasGoogleMap = typeof window !== 'undefined' && window.google?.maps

  const clearMarkers = (group) => {
    Object.values(group.current).forEach(marker => marker.setMap(null))
    Object.keys(group.current).forEach(key => delete group.current[key])
  }

  const placeFoodMarkers = (rows) => {
    if (!mapInstance.current || !hasGoogleMap) return
    clearMarkers(listingMarkers)

    rows.forEach(listing => {
      const marker = new window.google.maps.Marker({
        position: { lat: Number(listing.pickup_lat), lng: Number(listing.pickup_lng) },
        map: mapInstance.current,
        title: listing.title,
        icon: { url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' },
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${listing.title}</strong><br/>${listing.quantity}<br/><span style="color:#16a34a">Available</span></div>`,
      })
      marker.addListener('click', () => infoWindow.open(mapInstance.current, marker))
      listingMarkers.current[listing.id] = marker
    })
  }

  const placeNgoMarkers = (rows) => {
    if (!mapInstance.current || !hasGoogleMap) return
    clearMarkers(ngoMarkers)

    rows.forEach(ngo => {
      const marker = new window.google.maps.Marker({
        position: { lat: Number(ngo.lat), lng: Number(ngo.lng) },
        map: mapInstance.current,
        title: ngo.full_name,
        icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${ngo.full_name}</strong><br/><span style="color:#1d4ed8">NGO</span></div>`,
      })
      marker.addListener('click', () => infoWindow.open(mapInstance.current, marker))
      ngoMarkers.current[ngo.id] = marker
    })
  }

  useEffect(() => {
    if (!hasGoogleMap || !mapRef.current) return

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 18.5204, lng: 73.8567 },
      zoom: 12,
      styles: mapStyles,
    })
  }, [hasGoogleMap])

  useEffect(() => {
    refetchListings({ status: 'available', limit: 300, offset: 0 }).catch(() => {})
    refetchUsers({ role: 'recipient', verified: true, limit: 300, offset: 0 }).catch(() => {})
  }, [refetchListings, refetchUsers])

  useEffect(() => {
    const activeListings = (allListings || []).filter(item => item.status === 'available')
    setListings(activeListings)
    placeFoodMarkers(activeListings)
  }, [allListings])

  useEffect(() => {
    const ngoRows = (users || []).filter(item => item.role === 'recipient' && item.is_verified && item.lat && item.lng)
    setNgos(ngoRows)
    placeNgoMarkers(ngoRows)
  }, [users])

  useRealtime('food_listings', 'INSERT', (payload) => {
    if (payload.new?.status === 'available') {
      refetchListings({ status: 'available', limit: 300, offset: 0 }).catch(() => {})
    }
  })

  useRealtime('food_listings', 'UPDATE', () => {
    refetchListings({ status: 'available', limit: 300, offset: 0 }).catch(() => {})
  })

  const legend = useMemo(() => `${listings.length} active listings | ${ngos.length} NGOs`, [listings.length, ngos.length])

  if (!hasGoogleMap) {
    return (
      <section className="p-6">
        <h1 className="text-xl font-semibold text-gray-800">Live Map</h1>
        <p className="mt-2 text-sm text-gray-500">Google Maps is not available in this environment. Configure the Maps script key to enable map rendering.</p>
      </section>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-4 md:px-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Live Map</h1>
          <p className="text-sm text-gray-500">{legend}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span><span className="mr-1 inline-block h-3 w-3 rounded-full bg-green-500" />Food</span>
          <span><span className="mr-1 inline-block h-3 w-3 rounded-full bg-blue-500" />NGO</span>
        </div>
      </div>
      <div ref={mapRef} className="flex-1" />
    </div>
  )
}

export default LiveMap
