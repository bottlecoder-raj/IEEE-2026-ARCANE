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
    }

    // Add markers for materials
    if (mapInstanceRef.current && materials) {
      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstanceRef.current.removeLayer(layer)
        }
      })

      // Add new markers
      materials.forEach((material) => {
        if (material.latitude && material.longitude) {
          const marker = L.marker([material.latitude, material.longitude])
            .addTo(mapInstanceRef.current)
            .bindPopup(
              `<b>${material.name}</b><br/>${material.category}<br/>${material.location}`
            )
        }
      })
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

