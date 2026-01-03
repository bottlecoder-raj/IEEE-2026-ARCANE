import express from 'express'
import {
  register,
  login,
  getCurrentUser,
  logout,
  supRegister,
  syncProfile
} from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authenticateFlexible } from '../middleware/supabase.middleware.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
// Supabase-based register (service role key)
router.post('/sup-register', supRegister)

// Protected routes
// /me accepts either backend JWT (old) or Supabase access token (new)
router.get('/me', authenticateFlexible, getCurrentUser)
router.post('/logout', authenticate, logout)
// Sync profile: used by client after signing in with Supabase to ensure profile row exists
router.post('/sync-profile', authenticateFlexible, syncProfile)

export default router

