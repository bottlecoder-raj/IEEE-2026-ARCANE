import { materialService } from '../services/material.service.js'

// Get all materials with optional filters
export const getMaterials = async (req, res, next) => {
  try {
    const filters = req.query
    const materials = await materialService.getMaterials(filters)

    res.json({
      success: true,
      materials,
      count: materials.length
    })
  } catch (error) {
    next(error)
  }
}

// Get material by ID
export const getMaterialById = async (req, res, next) => {
  try {
    const { id } = req.params
    const material = await materialService.getMaterialById(id)

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      })
    }

    res.json({
      success: true,
      material
    })
  } catch (error) {
    next(error)
  }
}

// Create new material (provider only)
export const createMaterial = async (req, res, next) => {
  try {
    const userId = req.userId
    const materialData = req.body

    const newMaterial = await materialService.createMaterial(materialData, userId)

    res.status(201).json({
      success: true,
      material: newMaterial
    })
  } catch (error) {
    next(error)
  }
}

// Update material (provider only, owner only)
export const updateMaterial = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.userId
    const materialData = req.body

    const updatedMaterial = await materialService.updateMaterial(
      id,
      materialData,
      userId
    )

    res.json({
      success: true,
      material: updatedMaterial
    })
  } catch (error) {
    next(error)
  }
}

// Delete material (provider only, owner only)
export const deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.userId

    await materialService.deleteMaterial(id, userId)

    res.json({
      success: true,
      message: 'Material deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// Get materials by provider
export const getMaterialsByProvider = async (req, res, next) => {
  try {
    const { providerId } = req.params
    const materials = await materialService.getMaterialsByProvider(providerId)

    res.json({
      success: true,
      materials,
      count: materials.length
    })
  } catch (error) {
    next(error)
  }
}

// Get nearby materials
export const getNearbyMaterials = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      })
    }

    const materials = await materialService.getNearbyMaterials(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 10
    )

    res.json({
      success: true,
      materials,
      count: materials.length
    })
  } catch (error) {
    next(error)
  }
}

