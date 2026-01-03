import express from 'express'
import {
  getUserImpact,
  getImpactSummary,
  getPlatformImpact
} from '../controllers/impact.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public route
router.get('/platform', getPlatformImpact)

// Protected routes
router.get('/summary', authenticate, getImpactSummary)
router.get('/user/:userId', getUserImpact)

export default router

