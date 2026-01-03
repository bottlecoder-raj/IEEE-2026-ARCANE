import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth.service'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        
        if (token && storedUser) {
          // Try to get fresh user data, fallback to stored
          try {
            const userData = await authService.getCurrentUser()
            const currentUser = userData?.user || userData
            setUser(currentUser)
            localStorage.setItem('user', JSON.stringify(currentUser))
          } catch (error) {
            // If API call fails, use stored user data (backend might not be running)
            try {
              setUser(JSON.parse(storedUser))
            } catch (parseError) {
              // If stored user is invalid, clear everything
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    // Prefer Supabase client auth if configured
    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { supabaseAuth } = await import('../services/supabaseAuth.service.js')
        const data = await supabaseAuth.signIn({ email, password })
        const token = data.session?.access_token
        if (token) {
          // Save token for API calls; backend will accept this token via flexible auth
          localStorage.setItem('token', token)
        }

        // Ensure profile exists on server
        try {
          const sync = await supabaseAuth.syncProfile(token)
          const user = sync.user
          localStorage.setItem('user', JSON.stringify(user))
          setUser(user)
          return { success: true, user }
        } catch (err) {
          // still return success if sign-in worked
          const user = { email }
          localStorage.setItem('user', JSON.stringify(user))
          setUser(user)
          return { success: true, user }
        }
      }

      // Fallback to existing backend login
      const response = await authService.login(email, password)
      localStorage.setItem('token', response.token)
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
      }
      return { success: true, user: response.user }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed'
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { supabaseAuth } = await import('../services/supabaseAuth.service.js')
        // Create user via Supabase client
        const data = await supabaseAuth.signUp({ email: userData.email, password: userData.password })
        // If created, prompt the user to sign in (or auto sign in if session available)
        const token = data.session?.access_token
        if (token) {
          localStorage.setItem('token', token)
        }

        // Create the profile in DB by calling backend endpoint with supabase token
        try {
          const sync = await supabaseAuth.syncProfile(token, { name: userData.name, role: userData.role, location: userData.location })
          const user = sync.user
          localStorage.setItem('user', JSON.stringify(user))
          setUser(user)
          return { success: true, user }
        } catch (err) {
          return { success: false, error: err.response?.data?.error || err.message || 'Registration failed' }
        }
      }

      // Fallback to existing backend register
      const response = await authService.register(userData)
      localStorage.setItem('token', response.token)
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
      }
      return { success: true, user: response.user }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed'
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isProvider: user?.role === 'provider',
    isSeeker: user?.role === 'seeker'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

