import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import RequestModal from '../components/RequestModal'
import { requestService } from '../services/request.service'

const Requests = () => {
  const { user, logout, isProvider } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      let data
      if (isProvider) {
        // Load requests for provider's materials
        data = await requestService.getRequestsForProvider(user?.id)
      } else {
        // Load seeker's own requests
        data = await requestService.getRequestsBySeeker(user?.id)
      }
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequest = () => {
    setSelectedRequest(null)
    setShowModal(true)
  }

  const handleViewRequest = (request) => {
    setSelectedRequest(request)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedRequest(null)
    loadRequests() // Refresh list after modal closes
  }

  return (
    <div className="requests-page">
      <Navbar user={user} onLogout={logout} />
      <div className="page-layout">
        <Sidebar user={user} />
        <div className="page-content">
          <div className="page-header">
            <h1>{isProvider ? 'Material Requests' : 'My Requests'}</h1>
            {!isProvider && (
              <button onClick={handleCreateRequest} className="btn-primary">
                Create New Request
              </button>
            )}
          </div>

          {loading ? (
            <div>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <p>
                {isProvider
                  ? 'No requests for your materials yet.'
                  : "You haven't created any requests yet."}
              </p>
              {!isProvider && (
                <button onClick={handleCreateRequest} className="btn-primary">
                  Create Your First Request
                </button>
              )}
            </div>
          ) : (
            <div className="requests-list">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="request-card"
                  onClick={() => handleViewRequest(request)}
                >
                  <div className="request-header">
                    <h3>{request.title}</h3>
                    <span className={`status-badge status-${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="request-description">{request.description}</p>
                  <div className="request-meta">
                    <span>Material: {request.materialName || 'N/A'}</span>
                    <span>
                      Created: {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showModal && (
            <RequestModal
              request={selectedRequest}
              onClose={handleCloseModal}
              isProvider={isProvider}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Requests

