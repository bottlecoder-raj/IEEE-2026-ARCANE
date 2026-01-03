import { authService } from '../services/auth.service.js'

// Register new user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, location } = req.body

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password, and role are required'
      })
    }

    if (!['provider', 'seeker'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be either "provider" or "seeker"'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      })
    }

    const result = await authService.register({
      name,
      email,
      password,
      role,
      location: location || null
    })

    res.status(201).json({
      success: true,
      token: result.token,
      user: result.user
    })
  } catch (error) {
    next(error)
  }
}

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    const result = await authService.login(email, password)

    res.json({
      success: true,
      token: result.token,
      user: result.user
    })
  } catch (error) {
    next(error)
  }
}

// Get current authenticated user
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const user = await authService.getUserById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

// Logout (optional - mainly for token blacklisting in future)
export const logout = async (req, res, next) => {
  try {
    // For now, logout is handled client-side by removing token
    // In future, can implement token blacklisting here
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    next(error)
  }
}

