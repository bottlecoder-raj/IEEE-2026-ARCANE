import api from './api'

export const impactService = {
  // Get user's impact data
  getUserImpact: async (userId) => {
    try {
      const response = await api.get(`/impact/user/${userId}`)
      return response.data
    } catch (error) {
      // Return placeholder data if endpoint doesn't exist
      return {
        carbonSaved: 0,
        materialsRecycled: 0,
        projectsCompleted: 0,
        impactScore: 0
      }
    }
  },

  // Get overall platform impact
  getPlatformImpact: async () => {
    try {
      const response = await api.get('/impact/platform')
      return response.data
    } catch (error) {
      return {
        totalCarbonSaved: 0,
        totalMaterialsRecycled: 0,
        totalProjects: 0
      }
    }
  },

  // Calculate impact for a transaction
  calculateImpact: async (transactionData) => {
    try {
      const response = await api.post('/impact/calculate', transactionData)
      return response.data
    } catch (error) {
      console.error('Error calculating impact:', error)
      return null
    }
  }
}

