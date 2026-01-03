import api from './api'

export const materialService = {
  // Get all materials with optional filters
  getMaterials: async (filters = {}) => {
    const response = await api.get('/materials', { params: filters })
    return response.data.materials || []
  },

  // Get single material by ID
  getMaterialById: async (id) => {
    const response = await api.get(`/materials/${id}`)
    return response.data.material || null
  },

  // Create new material listing (provider only)
  createMaterial: async (materialData) => {
    const response = await api.post('/materials', materialData)
    return response.data.material || response.data
  },

  // Update material listing (provider only)
  updateMaterial: async (id, materialData) => {
    const response = await api.put(`/materials/${id}`, materialData)
    return response.data.material || response.data
  },

  // Delete material listing (provider only)
  deleteMaterial: async (id) => {
    const response = await api.delete(`/materials/${id}`)
    return response.data
  },

  // Get materials by provider
  getMaterialsByProvider: async (providerId) => {
    const response = await api.get(`/materials/provider/${providerId}`)
    return response.data.materials || []
  }
}

