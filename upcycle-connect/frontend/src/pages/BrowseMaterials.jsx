import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MaterialCard from '../components/MaterialCard'
import FilterPanel from '../components/FilterPanel'
import MapView from '../components/MapView'
import { materialService } from '../services/material.service'

const BrowseMaterials = () => {
  const { user, logout } = useAuth()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    location: '',
    search: ''
  })
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'map'

  useEffect(() => {
    loadMaterials()
  }, [filters])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      const data = await materialService.getMaterials(filters)
      setMaterials(data || [])
    } catch (error) {
      console.error('Error loading materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  return (
    <div className="browse-materials-page">
      <Navbar user={user} onLogout={logout} />
      <div className="page-layout">
        <Sidebar user={user} />
        <div className="page-content">
          <div className="page-header">
            <h1>Browse Materials</h1>
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'active' : ''}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'active' : ''}
              >
                Map
              </button>
            </div>
          </div>

          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />

          {loading ? (
            <div>Loading materials...</div>
          ) : viewMode === 'map' ? (
            <MapView materials={materials} />
          ) : (
            <div className="materials-grid">
              {materials.length === 0 ? (
                <div className="empty-state">
                  <p>No materials found matching your filters.</p>
                </div>
              ) : (
                materials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrowseMaterials

