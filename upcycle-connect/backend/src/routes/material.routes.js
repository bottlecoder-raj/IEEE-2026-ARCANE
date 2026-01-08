import express from 'express'
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialsByProvider,
  getNearbyMaterials
} from '../controllers/material.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes
router.get('/', getMaterials)
router.get('/nearby', getNearbyMaterials)
router.get('/provider/:providerId', getMaterialsByProvider)
router.get('/:id', getMaterialById)

// Protected routes (provider only)
router.post('/', authenticate, authorize('provider'), createMaterial)
router.put('/:id', authenticate, authorize('provider'), updateMaterial)
router.delete('/:id', authenticate, authorize('provider'), deleteMaterial)

export default router

