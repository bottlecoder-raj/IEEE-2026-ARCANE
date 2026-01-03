import api from './api'

export const requestService = {
  // Get all requests
  getRequests: async (filters = {}) => {
    const response = await api.get('/requests', { params: filters })
    return response.data
  },

  // Get single request by ID
  getRequestById: async (id) => {
    const response = await api.get(`/requests/${id}`)
    return response.data
  },

  // Create new material request (seeker only)
  createRequest: async (requestData) => {
    const response = await api.post('/requests', requestData)
    return response.data
  },

  // Update request status
  updateRequest: async (id, requestData) => {
    const response = await api.put(`/requests/${id}`, requestData)
    return response.data
  },

  // Delete request
  deleteRequest: async (id) => {
    const response = await api.delete(`/requests/${id}`)
    return response.data
  },

  // Get requests by seeker
  getRequestsBySeeker: async (seekerId) => {
    const response = await api.get(`/requests/seeker/${seekerId}`)
    return response.data
  },

  // Get requests for provider's materials
  getRequestsForProvider: async (providerId) => {
    const response = await api.get(`/requests/provider/${providerId}`)
    return response.data
  }
}

