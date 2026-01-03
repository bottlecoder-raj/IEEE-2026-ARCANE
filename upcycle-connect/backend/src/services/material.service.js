import { calculateMaterialCarbonSaved } from '../utils/carbonCalculator.js'
import { filterByDistance } from '../utils/distance.js'
import { getSupabaseClient, handleSupabaseError, isSupabaseConfigured } from '../config/supabaseClient.js'

// In-memory storage fallback
let materials = []

// Helper to format material from database
const formatMaterial = (dbMaterial) => {
  if (!dbMaterial) return null
  return {
    id: dbMaterial.id,
    name: dbMaterial.name,
    description: dbMaterial.description,
    category: dbMaterial.category,
    quantity: dbMaterial.quantity,
    condition: dbMaterial.condition,
    location: dbMaterial.location,
    latitude: dbMaterial.latitude,
    longitude: dbMaterial.longitude,
    providerId: dbMaterial.provider_id,
    status: dbMaterial.status,
    carbonSaved: parseFloat(dbMaterial.carbon_saved || 0),
    createdAt: dbMaterial.created_at,
    updatedAt: dbMaterial.updated_at
  }
}

export const materialService = {
  // Get all materials with optional filters
  getMaterials: async (filters = {}) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {
      let query = supabase
        .from('materials')
        .select('*')
        .eq('status', 'available') // Only show available materials

    // Apply filters
    if (filters.category) {
      query = query.ilike('category', filters.category)
    }

    if (filters.condition) {
      query = query.ilike('condition', filters.condition)
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply limit if provided
    if (filters.limit) {
      query = query.limit(parseInt(filters.limit))
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      const dbError = handleSupabaseError(error)
      const err = new Error(dbError.message)
      err.statusCode = dbError.statusCode
      throw err
    }

      return data.map(formatMaterial)
    } else {
      // Fallback to in-memory storage
      let filteredMaterials = materials.filter(m => m.status === 'available')

      // Apply filters
      if (filters.category) {
        filteredMaterials = filteredMaterials.filter(
          m => m.category?.toLowerCase() === filters.category.toLowerCase()
        )
      }
      if (filters.condition) {
        filteredMaterials = filteredMaterials.filter(
          m => m.condition?.toLowerCase() === filters.condition.toLowerCase()
        )
      }
      if (filters.location) {
        filteredMaterials = filteredMaterials.filter(
          m => m.location?.toLowerCase().includes(filters.location.toLowerCase())
        )
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredMaterials = filteredMaterials.filter(
          m => m.name?.toLowerCase().includes(searchLower) ||
               m.description?.toLowerCase().includes(searchLower)
        )
      }
      if (filters.limit) {
        filteredMaterials = filteredMaterials.slice(0, parseInt(filters.limit))
      }

      return filteredMaterials
    }
  },

  // Get material by ID
  getMaterialById: async (id) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        return null
      }

      return formatMaterial(data)
    } else {
      // Fallback to in-memory storage
      return materials.find(m => m.id === id) || null
    }
  },

  // Create new material
  createMaterial: async (materialData, userId) => {
    const supabase = getSupabaseClient()
    const {
      name,
      description,
      category,
      quantity,
      condition,
      location,
      latitude,
      longitude
    } = materialData

    // Validation
    if (!name || !description || !category || !quantity || !condition) {
      const error = new Error('Missing required fields')
      error.statusCode = 400
      throw error
    }

    // Calculate carbon saved
    const carbonSaved = calculateMaterialCarbonSaved({
      category,
      quantity: parseInt(quantity)
    })

    // Insert into database
    const { data, error } = await supabase
      .from('materials')
      .insert({
        name,
        description,
        category: category.toLowerCase(),
        quantity: parseInt(quantity),
        condition: condition.toLowerCase(),
        location: location || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        provider_id: userId,
        status: 'available',
        carbon_saved: parseFloat(carbonSaved)
      })
      .select()
      .single()

    if (error) {
      const dbError = handleSupabaseError(error)
      const err = new Error(dbError.message)
      err.statusCode = dbError.statusCode
      throw err
    }

      return formatMaterial(data)
    } else {
      // Fallback to in-memory storage
      const newMaterial = {
        id: `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        category: category.toLowerCase(),
        quantity: parseInt(quantity),
        condition: condition.toLowerCase(),
        location: location || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        providerId: userId,
        status: 'available',
        carbonSaved: parseFloat(carbonSaved),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      materials.push(newMaterial)
      return newMaterial
    }
  },

  // Update material
  updateMaterial: async (id, materialData, userId) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {

    // First check if material exists and user owns it
    const { data: existingMaterial, error: fetchError } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingMaterial) {
      const error = new Error('Material not found')
      error.statusCode = 404
      throw error
    }

    if (existingMaterial.provider_id !== userId) {
      const error = new Error('Not authorized to update this material')
      error.statusCode = 403
      throw error
    }

    // Prepare update data
    const updateData = {
      ...materialData,
      updated_at: new Date().toISOString()
    }

    // Recalculate carbon saved if quantity or category changed
    if (materialData.quantity || materialData.category) {
      updateData.carbon_saved = calculateMaterialCarbonSaved({
        category: materialData.category || existingMaterial.category,
        quantity: materialData.quantity || existingMaterial.quantity
      })
    }

    // Map frontend field names to database column names
    if (updateData.providerId) {
      updateData.provider_id = updateData.providerId
      delete updateData.providerId
    }
    if (updateData.carbonSaved !== undefined) {
      updateData.carbon_saved = updateData.carbonSaved
      delete updateData.carbonSaved
    }

    const { data, error } = await supabase
      .from('materials')
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

      return formatMaterial(data)
    } else {
      // Fallback to in-memory storage
      const materialIndex = materials.findIndex(m => m.id === id)
      if (materialIndex === -1) {
        const error = new Error('Material not found')
        error.statusCode = 404
        throw error
      }
      const material = materials[materialIndex]
      if (material.providerId !== userId) {
        const error = new Error('Not authorized to update this material')
        error.statusCode = 403
        throw error
      }
      const updatedMaterial = {
        ...material,
        ...materialData,
        updatedAt: new Date().toISOString()
      }
      if (materialData.quantity || materialData.category) {
        updatedMaterial.carbonSaved = calculateMaterialCarbonSaved({
          category: updatedMaterial.category,
          quantity: updatedMaterial.quantity
        })
      }
      materials[materialIndex] = updatedMaterial
      return updatedMaterial
    }
  },

  // Delete material
  deleteMaterial: async (id, userId) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {

    // First check if material exists and user owns it
    const { data: existingMaterial, error: fetchError } = await supabase
      .from('materials')
      .select('provider_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingMaterial) {
      const error = new Error('Material not found')
      error.statusCode = 404
      throw error
    }

    if (existingMaterial.provider_id !== userId) {
      const error = new Error('Not authorized to delete this material')
      error.statusCode = 403
      throw error
    }

    const { error } = await supabase
      .from('materials')
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
      const materialIndex = materials.findIndex(m => m.id === id)
      if (materialIndex === -1) {
        const error = new Error('Material not found')
        error.statusCode = 404
        throw error
      }
      const material = materials[materialIndex]
      if (material.providerId !== userId) {
        const error = new Error('Not authorized to delete this material')
        error.statusCode = 403
        throw error
      }
      materials.splice(materialIndex, 1)
      return { success: true }
    }
  },

  // Get materials by provider
  getMaterialsByProvider: async (providerId) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    if (error) {
      const dbError = handleSupabaseError(error)
      const err = new Error(dbError.message)
      err.statusCode = dbError.statusCode
      throw err
    }

      return data.map(formatMaterial)
    } else {
      // Fallback to in-memory storage
      return materials.filter(m => m.providerId === providerId)
    }
  },

  // Get nearby materials
  getNearbyMaterials: async (latitude, longitude, radius = 10) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {

    // Get all available materials with coordinates
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('status', 'available')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) {
      const dbError = handleSupabaseError(error)
      const err = new Error(dbError.message)
      err.statusCode = dbError.statusCode
      throw err
    }

    // Format materials
    const formattedMaterials = data.map(formatMaterial)

      // Filter by distance
      return filterByDistance(formattedMaterials, latitude, longitude, radius)
    } else {
      // Fallback to in-memory storage
      const allMaterials = materials.filter(
        m => m.latitude && m.longitude && m.status === 'available'
      )
      return filterByDistance(allMaterials, latitude, longitude, radius)
    }
  }
}

