import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

// Authentication middleware to verify JWT tokens
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Authorization header required.'
      })
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      })
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwtSecret)
      
      // Attach user info to request object
      req.user = decoded
      req.userId = decoded.userId || decoded.id
      req.userRole = decoded.role
      
      next()
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    })
  }
}

// Role-based authorization middleware
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions. Required role: ' + allowedRoles.join(' or ')
      })
    }

    next()
  }
}

