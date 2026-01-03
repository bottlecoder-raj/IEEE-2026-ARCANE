import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabaseClient.js'
import { config } from '../config/env.js'

// Flexible authentication middleware: accepts either backend JWT or Supabase access token
export const authenticateFlexible = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' })
    }

    const token = authHeader.substring(7)

    // Try verifying backend JWT first
    try {
      const decoded = jwt.verify(token, config.jwtSecret)
      req.user = decoded
      req.userId = decoded.userId || decoded.id
      req.userRole = decoded.role
      req.authSource = 'jwt'
      return next()
    } catch (e) {
      // Not a backend JWT, try Supabase access token
    }

    // If Supabase client not configured, reject
    if (!supabase) {
      return res.status(401).json({ success: false, error: 'Invalid token' })
    }

    // Verify Supabase token
    try {
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data?.user) {
        return res.status(401).json({ success: false, error: 'Invalid Supabase token' })
      }

      req.user = data.user
      req.userId = data.user.id
      req.userRole = null // will be filled from profile if needed
      req.authSource = 'supabase'
      next()
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' })
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authentication error' })
  }
}
