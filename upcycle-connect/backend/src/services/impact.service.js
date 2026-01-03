import { calculateImpactScore } from '../utils/carbonCalculator.js'
import { materialService } from './material.service.js'
import { requestService } from './request.service.js'

export const impactService = {
  // Get user's impact summary
  getUserImpact: async (userId) => {
    // Get user's materials (if provider)
    const materials = await materialService.getMaterialsByProvider(userId)
    
    // Get user's requests (if seeker)
    const requests = await requestService.getRequestsBySeeker(userId)
    
    // Calculate carbon saved from materials
    const carbonSaved = materials.reduce((total, material) => {
      return total + parseFloat(material.carbonSaved || 0)
    }, 0)
    
    // Count materials recycled
    const materialsRecycled = materials.length
    
    // Count completed projects (requests with completed status)
    const projectsCompleted = requests.filter(
      r => r.status === 'completed'
    ).length
    
    // Calculate impact score
    const impactScore = calculateImpactScore({
      carbonSaved,
      materialsRecycled,
      projectsCompleted
    })
    
    return {
      carbonSaved: parseFloat(carbonSaved.toFixed(2)),
      materialsRecycled,
      projectsCompleted,
      impactScore
    }
  },

  // Get impact summary (for authenticated user)
  getImpactSummary: async (userId, userRole) => {
    // This is similar to getUserImpact but uses the authenticated user
    return await impactService.getUserImpact(userId)
  },

  // Get platform-wide impact
  getPlatformImpact: async () => {
    // Get all materials
    const allMaterials = await materialService.getMaterials()
    
    // Calculate total carbon saved
    const totalCarbonSaved = allMaterials.reduce((total, material) => {
      return total + parseFloat(material.carbonSaved || 0)
    }, 0)
    
    // Count total materials
    const totalMaterialsRecycled = allMaterials.length
    
    // Get all requests
    const allRequests = await requestService.getRequests()
    const totalProjects = allRequests.filter(
      r => r.status === 'completed'
    ).length
    
    return {
      totalCarbonSaved: parseFloat(totalCarbonSaved.toFixed(2)),
      totalMaterialsRecycled,
      totalProjects
    }
  }
}

