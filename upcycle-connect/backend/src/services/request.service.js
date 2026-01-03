import { getSupabaseClient, handleSupabaseError, isSupabaseConfigured } from '../config/supabaseClient.js'

// In-memory storage fallback
let requests = []

// Helper to format request from database
const formatRequest = (dbRequest) => {
  if (!dbRequest) return null
  return {
    id: dbRequest.id,
    title: dbRequest.title,
    description: dbRequest.description,
    materialId: dbRequest.material_id,
    quantity: dbRequest.quantity,
    seekerId: dbRequest.seeker_id,
    status: dbRequest.status,
    createdAt: dbRequest.created_at,
    updatedAt: dbRequest.updated_at
  }
}

export const requestService = {
  // Get all requests
  getRequests: async (filters = {}) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {
      let query = supabase.from('requests').select('*')

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.materialId) {
        query = query.eq('material_id', filters.materialId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        const dbError = handleSupabaseError(error)
        const err = new Error(dbError.message)
        err.statusCode = dbError.statusCode
        throw err
      }

      return data.map(formatRequest)
    } else {
      // Fallback to in-memory storage
      let filteredRequests = [...requests]
      if (filters.status) {
        filteredRequests = filteredRequests.filter(r => r.status === filters.status)
      }
      if (filters.materialId) {
        filteredRequests = filteredRequests.filter(r => r.materialId === filters.materialId)
      }
      return filteredRequests
    }
  },

  // Get request by ID
  getRequestById: async (id) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        return null
      }

      return formatRequest(data)
    } else {
      // Fallback to in-memory storage
      return requests.find(r => r.id === id) || null
    }
  },

  // Create new request
  createRequest: async (requestData, userId) => {
    const supabase = getSupabaseClient()
    const { title, description, materialId, quantity } = requestData

    // Validation
    if (!title || !description) {
      const error = new Error('Title and description are required')
      error.statusCode = 400
      throw error
    }

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('requests')
        .insert({
          title,
          description,
          material_id: materialId || null,
          quantity: quantity ? parseInt(quantity) : null,
          seeker_id: userId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        const dbError = handleSupabaseError(error)
        const err = new Error(dbError.message)
        err.statusCode = dbError.statusCode
        throw err
      }

      return formatRequest(data)
    } else {
      // Fallback to in-memory storage
      const newRequest = {
        id: `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        materialId: materialId || null,
        quantity: quantity ? parseInt(quantity) : null,
        seekerId: userId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      requests.push(newRequest)
      return newRequest
    }
  },

  // Update request
  updateRequest: async (id, requestData, userId, userRole) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {
      // First check if request exists
      const { data: existingRequest, error: fetchError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !existingRequest) {
        const error = new Error('Request not found')
        error.statusCode = 404
        throw error
      }

      // Check authorization
      if (userRole === 'seeker' && existingRequest.seeker_id !== userId) {
        const error = new Error('Not authorized to update this request')
        error.statusCode = 403
        throw error
      }

      // Prepare update data
      const updateData = {
        updated_at: new Date().toISOString()
      }

      // Map frontend field names to database column names
      if (requestData.status !== undefined) updateData.status = requestData.status
      if (requestData.title !== undefined) updateData.title = requestData.title
      if (requestData.description !== undefined) updateData.description = requestData.description
      if (requestData.materialId !== undefined) updateData.material_id = requestData.materialId
      if (requestData.quantity !== undefined) updateData.quantity = requestData.quantity

      const { data, error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        const dbError = handleSupabaseError(error)
        const err = new Error(dbError.message)
        err.statusCode = dbError.statusCode
        throw err
      }

      return formatRequest(data)
    } else {
      // Fallback to in-memory storage
      const requestIndex = requests.findIndex(r => r.id === id)
      if (requestIndex === -1) {
        const error = new Error('Request not found')
        error.statusCode = 404
        throw error
      }
      const request = requests[requestIndex]
      if (userRole === 'seeker' && request.seekerId !== userId) {
        const error = new Error('Not authorized to update this request')
        error.statusCode = 403
        throw error
      }
      const updatedRequest = {
        ...request,
        ...requestData,
        updatedAt: new Date().toISOString()
      }
      requests[requestIndex] = updatedRequest
      return updatedRequest
    }
  },

  // Delete request
  deleteRequest: async (id, userId) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {
      // First check if request exists and user owns it
      const { data: existingRequest, error: fetchError } = await supabase
        .from('requests')
        .select('seeker_id')
        .eq('id', id)
        .single()

      if (fetchError || !existingRequest) {
        const error = new Error('Request not found')
        error.statusCode = 404
        throw error
      }

      if (existingRequest.seeker_id !== userId) {
        const error = new Error('Not authorized to delete this request')
        error.statusCode = 403
        throw error
      }

      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id)

      if (error) {
        const dbError = handleSupabaseError(error)
        const err = new Error(dbError.message)
        err.statusCode = dbError.statusCode
        throw err
      }

      return { success: true }
    } else {
      // Fallback to in-memory storage
      const requestIndex = requests.findIndex(r => r.id === id)
      if (requestIndex === -1) {
        const error = new Error('Request not found')
        error.statusCode = 404
        throw error
      }
      const request = requests[requestIndex]
      if (request.seekerId !== userId) {
        const error = new Error('Not authorized to delete this request')
        error.statusCode = 403
        throw error
      }
      requests.splice(requestIndex, 1)
      return { success: true }
    }
  },

  // Get requests by seeker
  getRequestsBySeeker: async (seekerId) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('seeker_id', seekerId)
        .order('created_at', { ascending: false })

      if (error) {
        const dbError = handleSupabaseError(error)
        const err = new Error(dbError.message)
        err.statusCode = dbError.statusCode
        throw err
      }

      return data.map(formatRequest)
    } else {
      // Fallback to in-memory storage
      return requests.filter(r => r.seekerId === seekerId)
    }
  },

  // Get requests for provider's materials
  getRequestsForProvider: async (providerId) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {
      // First get all material IDs for this provider
      const { data: materials, error: materialsError } = await supabase
        .from('materials')
        .select('id')
        .eq('provider_id', providerId)

      if (materialsError) {
        const dbError = handleSupabaseError(materialsError)
        const err = new Error(dbError.message)
        err.statusCode = dbError.statusCode
        throw err
      }

      const materialIds = materials.map(m => m.id)

      // If no materials, return empty array
      if (materialIds.length === 0) {
        return []
      }

      // Get all requests for these materials
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .in('material_id', materialIds)
        .order('created_at', { ascending: false })

      if (error) {
        const dbError = handleSupabaseError(error)
        const err = new Error(dbError.message)
        err.statusCode = dbError.statusCode
        throw err
      }

      return data.map(formatRequest)
    } else {
      // Fallback to in-memory storage
      // In real implementation would join with materials, for now return all non-completed
      return requests.filter(r => r.status !== 'completed')
    }
  },

  // Get user's requests (works for both seeker and provider)
  getUserRequests: async (userId, userRole) => {
    if (userRole === 'seeker') {
      return await requestService.getRequestsBySeeker(userId)
    } else if (userRole === 'provider') {
      return await requestService.getRequestsForProvider(userId)
    }
    return []
  }
}

