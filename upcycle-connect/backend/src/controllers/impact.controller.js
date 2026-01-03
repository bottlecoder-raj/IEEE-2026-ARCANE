import { impactService } from '../services/impact.service.js'

// Get user's impact data
export const getUserImpact = async (req, res, next) => {
  try {
    const { userId } = req.params
    const impact = await impactService.getUserImpact(userId)

    res.json({
      success: true,
      ...impact
    })
  } catch (error) {
    next(error)
  }
}

// Get impact summary for authenticated user
export const getImpactSummary = async (req, res, next) => {
  try {
    const userId = req.userId
    const userRole = req.userRole

    const impact = await impactService.getImpactSummary(userId, userRole)

    res.json({
      success: true,
      ...impact
    })
  } catch (error) {
    next(error)
  }
}

// Get platform-wide impact
export const getPlatformImpact = async (req, res, next) => {
  try {
    const impact = await impactService.getPlatformImpact()

    res.json({
      success: true,
      ...impact
    })
  } catch (error) {
    next(error)
  }
}

