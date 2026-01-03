import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MaterialCard from '../components/MaterialCard'
import { materialService } from '../services/material.service'

const ProviderDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMaterials: 0,
    activeRequests: 0,
    totalViews: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Load provider's materials
      const materialsData = await materialService.getMaterialsByProvider(user?.id)
      setMaterials(materialsData || [])
      
      // Calculate stats (placeholder - would come from backend)
      setStats({
        totalMaterials: materialsData?.length || 0,
        activeRequests: 0, // Would fetch from requests service
        totalViews: 0 // Would fetch from analytics
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMaterial = () => {
    navigate('/add-material')
  }

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={logout} />
      <div className="dashboard-layout">
        <Sidebar user={user} />
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Provider Dashboard</h1>
            <button onClick={handleAddMaterial} className="btn-primary">
              Add New Material
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Materials</h3>
              <p className="stat-value">{stats.totalMaterials}</p>
            </div>
            <div className="stat-card">
              <h3>Active Requests</h3>
              <p className="stat-value">{stats.activeRequests}</p>
            </div>
            <div className="stat-card">
              <h3>Total Views</h3>
              <p className="stat-value">{stats.totalViews}</p>
            </div>
          </div>

          <div className="materials-section">
            <h2>My Materials</h2>
            {materials.length === 0 ? (
              <div className="empty-state">
                <p>You haven't added any materials yet.</p>
                <button onClick={handleAddMaterial} className="btn-primary">
                  Add Your First Material
                </button>
              </div>
            ) : (
              <div className="materials-grid">
                {materials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProviderDashboard

