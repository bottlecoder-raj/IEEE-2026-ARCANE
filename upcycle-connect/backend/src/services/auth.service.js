import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { getSupabaseClient, handleSupabaseError, isSupabaseConfigured } from '../config/supabaseClient.js'

// In-memory storage fallback (when Supabase is not configured)
let users = []

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role,
      id: userId
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
}

export const authService = {
  // Register new user
  register: async (userData) => {
    const { name, email, password, role, location } = userData
    const supabase = getSupabaseClient()

    // Use Supabase if configured, otherwise use in-memory storage
    if (supabase && isSupabaseConfigured()) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle()

      if (existingUser) {
        const error = new Error('User with this email already exists')
        error.statusCode = 409
        throw error
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      // Insert user into database
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password_hash: passwordHash,
          role,
          location: location || null
        })
        .select('id, email, name, role, location, created_at, updated_at')
        .single()

      if (error) {
        const dbError = handleSupabaseError(error)
        const err = new Error(dbError.message)
        err.statusCode = dbError.statusCode
        throw err
      }

      // Format user object to match frontend expectations
      const user = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        location: newUser.location,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at
      }

      // Generate token
      const token = generateToken(user.id, user.role)

      return {
        token,
        user
      }
    } else {
      // Fallback to in-memory storage
      // Check if user already exists
      const existingUser = users.find(u => u.email === email)
      if (existingUser) {
        const error = new Error('User with this email already exists')
        error.statusCode = 409
        throw error
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      // Create user object
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password: passwordHash,
        role,
        location: location || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Store user in memory
      users.push(newUser)

      // Generate token
      const token = generateToken(newUser.id, newUser.role)

      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser

      return {
        token,
        user: userWithoutPassword
      }
    }
  },

  // Login user
  login: async (email, password) => {
    const supabase = getSupabaseClient()

    // Use Supabase if configured, otherwise use in-memory storage
    if (supabase && isSupabaseConfigured()) {
      // Find user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role, location, password_hash, created_at, updated_at')
        .eq('email', email)
        .maybeSingle()

      if (error || !user) {
        const err = new Error('Invalid email or password')
        err.statusCode = 401
        throw err
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash)
      
      if (!isPasswordValid) {
        const err = new Error('Invalid email or password')
        err.statusCode = 401
        throw err
      }

      // Format user object (without password)
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: user.location,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }

      // Generate token
      const token = generateToken(userData.id, userData.role)

      return {
        token,
        user: userData
      }
    } else {
      // Fallback to in-memory storage
      const user = users.find(u => u.email === email)
      
      if (!user) {
        const err = new Error('Invalid email or password')
        err.statusCode = 401
        throw err
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      
      if (!isPasswordValid) {
        const err = new Error('Invalid email or password')
        err.statusCode = 401
        throw err
      }

      // Generate token
      const token = generateToken(user.id, user.role)

      // Return user without password
      const { password: _, ...userWithoutPassword } = user

      return {
        token,
        user: userWithoutPassword
      }
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role, location, created_at, updated_at')
        .eq('id', userId)
        .single()

      if (error || !user) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: user.location,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    } else {
      // Fallback to in-memory storage
      const user = users.find(u => u.id === userId)
      if (!user) {
        return null
      }
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    }
  },

  // Get user by email
  getUserByEmail: async (email) => {
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured()) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role, location, created_at, updated_at')
        .eq('email', email)
        .single()

      if (error || !user) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: user.location,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    } else {
      // Fallback to in-memory storage
      const user = users.find(u => u.email === email)
      if (!user) {
        return null
      }
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    }
  }
}

