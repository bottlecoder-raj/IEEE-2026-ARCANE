import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import RequestModal from '../components/RequestModal'
import { materialService } from '../services/material.service'
import { useAuth } from '../context/AuthContext'

const MaterialDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isProvider, logout } = useAuth()
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [initialRequestData, setInitialRequestData] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await materialService.getMaterialById(id)
        if (!data) {
          // Material not found -> go back to materials
          navigate('/materials')
          return
        }
        setMaterial(data)
      } catch (err) {
        console.error('Failed to load material', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const handleConnect = () => {
    // Prefill request data using material details
    setInitialRequestData({
      title: `Request: ${material.name}`,
      description: `I'm interested in the material "${material.name}".\nMaterial details: ${material.description || ''}\nLocation: ${material.location || 'N/A'}\nAvailable quantity: ${material.quantity || 'N/A'}.\nPlease confirm availability and next steps.`,
      materialId: material.id,
      quantity: 1
    })
    setShowModal(true)
  }

  if (loading) return <div>Loading material...</div>

  if (!material) return <div>Material not found</div>

  return (
    <div className="material-details-page">
      <Navbar user={user} onLogout={logout} />
      <div className="page-layout">
        <Sidebar user={user} />
        <div className="page-content">
          <div className="material-card-large">
            <div className="media">
              <div className="placeholder-image">No Image</div>
            </div>
            <div className="content">
              <h1>{material.name}</h1>
              <p className="muted">{material.description}</p>

              <div className="meta">
                <div>Condition: {material.condition}</div>
                <div>Quantity: {material.quantity}</div>
                <div>Location: {material.location}</div>
              </div>

              {!isProvider && (
                <div className="actions">
                  <button className="btn-primary" onClick={handleConnect}>
                    Connect (Request / Chat)
                  </button>
                </div>
              )}
            </div>
          </div>

          {showModal && (
            <RequestModal
              request={null}
              initialData={initialRequestData}
              onClose={() => setShowModal(false)}
              isProvider={isProvider}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MaterialDetails
