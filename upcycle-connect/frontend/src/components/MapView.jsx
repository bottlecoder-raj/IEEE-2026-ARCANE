import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

const MapView = ({ materials }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([40.7128, -74.0060], 10)

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current)

      // Ensure Leaflet lays out properly (useful if the map was hidden when initialized)
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize()
      }, 0)
    }

    // Add markers for materials
    if (mapInstanceRef.current && materials) {
      try {
        // Clear existing markers
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current.removeLayer(layer)
          }
        })

        const bounds = L.latLngBounds([])

        // Add new markers
        materials.forEach((material) => {
          const lat = material.latitude !== null && material.latitude !== undefined ? parseFloat(material.latitude) : null
          const lng = material.longitude !== null && material.longitude !== undefined ? parseFloat(material.longitude) : null

          if (lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
            L.marker([lat, lng])
              .addTo(mapInstanceRef.current)
              .bindPopup(
                `<b>${material.name}</b><br/>${material.category}<br/>${material.location}`
              )
            bounds.extend([lat, lng])
          }
        })

        // Fit map to markers if any, else keep default center
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
        }

        // Ensure map properly renders (in case it was hidden when initialized)
        setTimeout(() => {
          if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize()
        }, 0)
      } catch (err) {
        // Log map errors for easier debugging
        // eslint-disable-next-line no-console
        console.error('Map rendering error:', err)
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [materials])

  return (
    <div className="map-view">
      <div ref={mapRef} className="map-container" />
      <div className="map-info">
        <p>Showing {materials?.length || 0} materials on map</p>
        <p className="map-note">
          Note: Only materials with location coordinates are displayed
        </p>
      </div>
    </div>
  )
}

export default MapView

