import { requestService } from '../services/request.service.js'

// Get all requests
export const getRequests = async (req, res, next) => {
  try {
    const filters = req.query
    const requests = await requestService.getRequests(filters)

    res.json({
      success: true,
      requests,
      count: requests.length
    })
  } catch (error) {
    next(error)
  }
}

// Get request by ID
export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params
    const request = await requestService.getRequestById(id)

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      })
    }

    res.json({
      success: true,
      request
    })
  } catch (error) {
    next(error)
  }
}

// Create new request (seeker only)
export const createRequest = async (req, res, next) => {
  try {
    const userId = req.userId
    const requestData = req.body

    const newRequest = await requestService.createRequest(requestData, userId)

    res.status(201).json({
      success: true,
      request: newRequest
    })
  } catch (error) {
    next(error)
  }
}

// Update request
export const updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.userId
    const userRole = req.userRole
    const requestData = req.body

    const updatedRequest = await requestService.updateRequest(
      id,
      requestData,
      userId,
      userRole
    )

    res.json({
      success: true,
      request: updatedRequest
    })
  } catch (error) {
    next(error)
  }
}

// Delete request (seeker only, owner only)
export const deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.userId

    await requestService.deleteRequest(id, userId)

    res.json({
      success: true,
      message: 'Request deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// Get requests by seeker
export const getRequestsBySeeker = async (req, res, next) => {
  try {
    const { seekerId } = req.params
    const requests = await requestService.getRequestsBySeeker(seekerId)

    res.json({
      success: true,
      requests,
      count: requests.length
    })
  } catch (error) {
    next(error)
  }
}

// Get requests for provider
export const getRequestsForProvider = async (req, res, next) => {
  try {
    const { providerId } = req.params
    const requests = await requestService.getRequestsForProvider(providerId)

    res.json({
      success: true,
      requests,
      count: requests.length
    })
  } catch (error) {
    next(error)
  }
}

// Get user's requests (unified endpoint)
export const getUserRequests = async (req, res, next) => {
  try {
    const userId = req.userId
    const userRole = req.userRole

    const requests = await requestService.getUserRequests(userId, userRole)

    res.json({
      success: true,
      requests,
      count: requests.length
    })
  } catch (error) {
    next(error)
  }
}

