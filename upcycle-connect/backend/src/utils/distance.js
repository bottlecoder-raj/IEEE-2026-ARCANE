// Distance calculation utilities using Haversine formula

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
const toRad = (degrees) => {
  return (degrees * Math.PI) / 180
}

/**
 * Filter materials by distance from a given location
 * @param {Array} materials - Array of material objects with latitude/longitude
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {number} radiusKm - Maximum radius in kilometers
 * @returns {Array} Filtered materials with distance added
 */
export const filterByDistance = (materials, userLat, userLon, radiusKm = 10) => {
  return materials
    .filter((material) => {
      if (!material.latitude || !material.longitude) {
        return false
      }
      const distance = calculateDistance(
        userLat,
        userLon,
        material.latitude,
        material.longitude
      )
      material.distance = distance
      return distance <= radiusKm
    })
    .sort((a, b) => a.distance - b.distance) // Sort by distance
}

