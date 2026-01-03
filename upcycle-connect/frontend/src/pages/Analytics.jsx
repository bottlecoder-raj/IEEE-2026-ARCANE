import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ImpactStats from '../components/ImpactStats'
import { impactService } from '../services/impact.service'

const Analytics = () => {
  const { user, logout } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      // This would fetch from impact service
      const data = await impactService.getUserImpact(user?.id)
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
      // Set placeholder data if service doesn't exist yet
      setAnalytics({
        carbonSaved: 0,
        materialsRecycled: 0,
        projectsCompleted: 0,
        impactScore: 0
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="analytics-page">
      <Navbar user={user} onLogout={logout} />
      <div className="page-layout">
        <Sidebar user={user} />
        <div className="page-content">
          <h1>Impact Analytics</h1>

          {loading ? (
            <div>Loading analytics...</div>
          ) : (
            <>
              <ImpactStats analytics={analytics} />

              <div className="charts-section">
                <h2>Impact Over Time</h2>
                <div className="chart-placeholder">
                  <p>Chart.js integration placeholder</p>
                  <p>Carbon footprint reduction chart will be displayed here</p>
                </div>
              </div>

              <div className="charts-section">
                <h2>Materials Recycled</h2>
                <div className="chart-placeholder">
                  <p>Chart.js integration placeholder</p>
                  <p>Materials recycled over time chart will be displayed here</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics

