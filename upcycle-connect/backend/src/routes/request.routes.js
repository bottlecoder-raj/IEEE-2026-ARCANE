import express from 'express'
import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  getRequestsBySeeker,
  getRequestsForProvider,
  getUserRequests
} from '../controllers/request.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes (if any)
router.get('/', getRequests)
router.get('/:id', getRequestById)

// Protected routes
router.post('/', authenticate, authorize('seeker'), createRequest)
router.put('/:id', authenticate, updateRequest)
router.delete('/:id', authenticate, authorize('seeker'), deleteRequest)

// User-specific routes
router.get('/user', authenticate, getUserRequests)
router.get('/seeker/:seekerId', getRequestsBySeeker)
router.get('/provider/:providerId', getRequestsForProvider)

export default router

