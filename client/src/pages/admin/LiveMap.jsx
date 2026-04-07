import { useEffect, useMemo, useState } from 'react'
import useRealtime from '../../hooks/useRealtime'
import useAdminData from '../../hooks/useAdminData'
import { Map, MapMarker, MarkerContent, MarkerPopup } from '../../components/ui/map'

const osmStyle = {
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

const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 }

const distanceToPune = (lat, lng) => {
  const dLat = lat - PUNE_CENTER.lat
  const dLng = lng - PUNE_CENTER.lng
  return Math.sqrt((dLat * dLat) + (dLng * dLng))
}

const normalizeCoords = (latRaw, lngRaw) => {
  const lat = Number(latRaw)
  const lng = Number(lngRaw)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const asIsValid = Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  const swappedValid = Math.abs(lng) <= 90 && Math.abs(lat) <= 180

  if (!asIsValid && !swappedValid) return null
  if (asIsValid && !swappedValid) return { lat, lng }
  if (!asIsValid && swappedValid) return { lat: lng, lng: lat }

  // If both are technically valid, prefer the orientation closer to our operating region.
  const asIsDist = distanceToPune(lat, lng)
  const swappedDist = distanceToPune(lng, lat)
  return swappedDist < asIsDist ? { lat: lng, lng: lat } : { lat, lng }
}

const geocodeAddress = async (address) => {
  if (!address || typeof window === 'undefined') return null

  const key = `ngo-geocode:${address.trim().toLowerCase()}`
  const cached = window.sessionStorage.getItem(key)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (Number.isFinite(parsed?.lat) && Number.isFinite(parsed?.lng)) {
        return parsed
      }
    } catch {
      window.sessionStorage.removeItem(key)
    }
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
    const response = await fetch(url)
    if (!response.ok) return null

    const payload = await response.json()
    if (!Array.isArray(payload) || payload.length === 0) return null

    const lat = Number(payload[0].lat)
    const lng = Number(payload[0].lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

    const value = { lat, lng }
    window.sessionStorage.setItem(key, JSON.stringify(value))
    return value
  } catch {
    return null
  }
}

const LiveMap = () => {
  const [ngos, setNgos] = useState([])
  const { refetchUsers, users } = useAdminData()

  useEffect(() => {
    refetchUsers({ role: 'recipient', limit: 300, offset: 0 }).catch(() => {})
  }, [refetchUsers])

  useEffect(() => {
    let cancelled = false

    const resolveNgos = async () => {
      const recipients = (users || []).filter(item => item.role === 'recipient')

      const resolved = await Promise.all(recipients.map(async (item) => {
        const normalized = normalizeCoords(item.lat, item.lng)
        const geocoded = await geocodeAddress(item.address)
        const finalCoords = geocoded || normalized

        if (!finalCoords) return null
        return { ...item, lat: finalCoords.lat, lng: finalCoords.lng }
      }))

      if (!cancelled) {
        setNgos(resolved.filter(Boolean))
      }
    }

    resolveNgos()
    return () => {
      cancelled = true
    }
  }, [users])

  useRealtime('app_users', 'INSERT', (payload) => {
    if (payload.new?.role === 'recipient') {
      refetchUsers({ role: 'recipient', limit: 300, offset: 0 }).catch(() => {})
    }
  })

  useRealtime('app_users', 'UPDATE', (payload) => {
    if (payload.new?.role === 'recipient' || payload.old?.role === 'recipient') {
      refetchUsers({ role: 'recipient', limit: 300, offset: 0 }).catch(() => {})
    }
  })

  const legend = useMemo(() => `${ngos.length} NGOs`, [ngos.length])
  const ngosWithCoords = ngos.filter(item => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng)))

  const mapCenter = useMemo(() => {
    if (!ngosWithCoords.length) return [73.8567, 18.5204]

    const totals = ngosWithCoords.reduce((acc, item) => {
      acc.lat += Number(item.lat)
      acc.lng += Number(item.lng)
      return acc
    }, { lat: 0, lng: 0 })

    return [totals.lng / ngosWithCoords.length, totals.lat / ngosWithCoords.length]
  }, [ngosWithCoords])

  const mapZoom = ngosWithCoords.length <= 1 ? 13 : 11

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-4 md:px-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Live Map</h1>
          <p className="text-sm text-gray-500">{legend}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span><span className="mr-1 inline-block h-3 w-3 rounded-full bg-blue-500" />NGO</span>
        </div>
      </div>
      <div className="flex-1 min-h-[420px]">
        <Map
          key={`${mapCenter[0]}-${mapCenter[1]}-${ngosWithCoords.length}`}
          className="h-full w-full"
          center={mapCenter}
          zoom={mapZoom}
          theme="light"
          styles={{
            light: osmStyle,
            dark: osmStyle,
          }}
        >
          {ngosWithCoords.map(item => (
            <MapMarker
              key={`ngo-${item.id}`}
              longitude={Number(item.lng)}
              latitude={Number(item.lat)}
            >
              <MarkerContent>
                <div className="h-5 w-5 rounded-full border-2 border-white bg-blue-500 shadow" />
              </MarkerContent>
              <MarkerPopup>
                <div className="max-w-[220px] text-sm">
                  <p className="font-semibold text-gray-800">{item.full_name}</p>
                  <p className="mt-1 text-blue-600">NGO</p>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </div>
    </div>
  )
}

export default LiveMap
