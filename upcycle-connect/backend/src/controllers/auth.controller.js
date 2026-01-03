import { authService } from '../services/auth.service.js'

// Register new user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, location } = req.body

    console.log(`[Auth] Register attempt: ${email}, role=${role}`)

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

    console.log(`[Auth] Login attempt: ${email}`)

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

// Get current authenticated user (supports backend JWT or Supabase token)
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    // If Supabase is configured and the request used a Supabase token, try to read from profiles
    const { getSupabaseClient, isSupabaseConfigured } = await import('../config/supabaseClient.js')
    const supabase = getSupabaseClient()

    if (supabase && isSupabaseConfigured() && req.authSource === 'supabase') {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, location, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        // fall back to authService
      } else if (profile) {
        return res.json({ success: true, user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          location: profile.location,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        }})
      }
    }

    // Fallback: return user from our internal service (in-memory or users table)
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

// Register a new user via Supabase Auth (service role key required)
export const supRegister = async (req, res, next) => {
  try {
    const { name, email, password, role, location } = req.body
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Email, password, and role are required' })
    }

    const { getSupabaseClient, isSupabaseConfigured } = await import('../config/supabaseClient.js')
    const supabase = getSupabaseClient()

    if (!supabase || !isSupabaseConfigured()) {
      return res.status(500).json({ success: false, error: 'Supabase not configured on server' })
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError || !authUser) {
      const err = new Error(authError?.message || 'Failed to create auth user')
      err.statusCode = 400
      throw err
    }

    // Insert profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({ id: authUser.id, email, name: name || null, role, location: location || null })
      .select()
      .maybeSingle()

    if (profileError) {
      const err = new Error(profileError.message)
      err.statusCode = 500
      throw err
    }

    res.status(201).json({ success: true, user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      location: profile.location
    }})
  } catch (error) {
    next(error)
  }
}

// Ensure a profile exists for the authenticated Supabase user (use when client signs in)
export const syncProfile = async (req, res, next) => {
  try {
    const userId = req.userId
    if (!userId) return res.status(401).json({ success: false, error: 'No authenticated user' })

    const { name, role, location } = req.body // optional profile fields

    const { getSupabaseClient, isSupabaseConfigured } = await import('../config/supabaseClient.js')
    const supabase = getSupabaseClient()

    if (!supabase || !isSupabaseConfigured()) return res.status(500).json({ success: false, error: 'Supabase not configured' })

    // Check existing profile
    const { data: existing, error: e } = await supabase
      .from('profiles')
      .select('id, email, name, role, location, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle()

    if (e) {
      const err = new Error(e.message)
      err.statusCode = 500
      throw err
    }

    if (existing) {
      return res.json({ success: true, user: existing })
    }

    // Get user email from Supabase auth if possible
    const { data: supUser, error: supUserErr } = await supabase.auth.getUser(req.headers.authorization.substring(7))
    const email = supUser?.data?.user?.email || null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({ id: userId, email, name: name || null, role: role || 'seeker', location: location || null })
      .select()
      .maybeSingle()

    if (profileError) {
      const err = new Error(profileError.message)
      err.statusCode = 500
      throw err
    }

    res.status(201).json({ success: true, user: profile })
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

