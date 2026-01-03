import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MaterialCard from '../components/MaterialCard'
import { materialService } from '../services/material.service'
import { requestService } from '../services/request.service'

const SeekerDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [materials, setMaterials] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeRequests: 0,
    materialsFound: 0,
    impactScore: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Load available materials
      const materialsData = await materialService.getMaterials({ limit: 6 })
      setMaterials(materialsData || [])
      
      // Load user's requests
      const requestsData = await requestService.getRequestsBySeeker(user?.id)
      setRequests(requestsData || [])
      
      // Calculate stats
      setStats({
        activeRequests: requestsData?.length || 0,
        materialsFound: materialsData?.length || 0,
        impactScore: 0 // Would calculate from impact service
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBrowseMaterials = () => {
    navigate('/materials')
  }

  const handleCreateRequest = () => {
    navigate('/requests')
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
            <h1>Seeker Dashboard</h1>
            <div className="header-actions">
              <button onClick={handleBrowseMaterials} className="btn-secondary">
                Browse Materials
              </button>
              <button onClick={handleCreateRequest} className="btn-primary">
                Create Request
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Active Requests</h3>
              <p className="stat-value">{stats.activeRequests}</p>
            </div>
            <div className="stat-card">
              <h3>Materials Found</h3>
              <p className="stat-value">{stats.materialsFound}</p>
            </div>
            <div className="stat-card">
              <h3>Impact Score</h3>
              <p className="stat-value">{stats.impactScore}</p>
            </div>
          </div>

          <div className="materials-section">
            <h2>Available Materials</h2>
            {materials.length === 0 ? (
              <div className="empty-state">
                <p>No materials available at the moment.</p>
                <button onClick={handleBrowseMaterials} className="btn-primary">
                  Browse All Materials
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

          <div className="requests-section">
            <h2>My Requests</h2>
            {requests.length === 0 ? (
              <div className="empty-state">
                <p>You haven't created any requests yet.</p>
                <button onClick={handleCreateRequest} className="btn-primary">
                  Create Your First Request
                </button>
              </div>
            ) : (
              <div className="requests-list">
                {requests.map((request) => (
                  <div key={request.id} className="request-item">
                    <h4>{request.title}</h4>
                    <p>Status: {request.status}</p>
                    <p>Created: {new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeekerDashboard

