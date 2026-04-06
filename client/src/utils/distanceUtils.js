const RADIUS_KM = 6371

const toRad = (deg) => (deg * Math.PI) / 180

export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some(v => v === null || v === undefined || Number.isNaN(Number(v)))) {
    return null
  }

  const dLat = toRad(Number(lat2) - Number(lat1))
  const dLon = toRad(Number(lon2) - Number(lon1))
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) * Math.sin(dLon / 2) ** 2

  return RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const formatDistance = (km) => {
  if (km === null || km === undefined || Number.isNaN(Number(km))) {
    return 'Distance unavailable'
  }
  const value = Number(km)
  if (value < 1) return `${Math.round(value * 1000)} m`
  return `${value.toFixed(1)} km`
}
