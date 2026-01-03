import { useState, useEffect } from 'react'
import { requestService } from '../services/request.service'

const RequestModal = ({ request, onClose, isProvider, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    materialId: '',
    quantity: '',
    status: 'pending'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title || '',
        description: request.description || '',
        materialId: request.materialId || '',
        quantity: request.quantity || '',
        status: request.status || 'pending'
      })
    } else if (initialData) {
      // Pre-fill fields when opening modal from e.g. a material details page
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        materialId: initialData.materialId || '',
        quantity: initialData.quantity || '',
        status: initialData.status || 'pending'
      })
    }
  }, [request, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (request) {
        // Update existing request
        await requestService.updateRequest(request.id, formData)
      } else {
        // Create new request
        await requestService.createRequest(formData)
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save request')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!request || !window.confirm('Are you sure you want to delete this request?')) {
      return
    }

    try {
      await requestService.deleteRequest(request.id)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete request')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{request ? 'View/Edit Request' : 'Create New Request'}</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={isProvider && request}
              placeholder="Request title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              disabled={isProvider && request}
              placeholder="Describe what material you need"
            />
          </div>

          {!isProvider && (
            <>
              <div className="form-group">
                <label htmlFor="materialId">Material ID (optional)</label>
                <input
                  type="text"
                  id="materialId"
                  name="materialId"
                  value={formData.materialId}
                  onChange={handleChange}
                  placeholder="Specific material ID if applicable"
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity Needed</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  placeholder="Quantity"
                />
              </div>
            </>
          )}

          {isProvider && request && (
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            {request && !isProvider && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn-danger"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            {(!isProvider || (isProvider && request)) && (
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : request ? 'Update' : 'Create'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default RequestModal

