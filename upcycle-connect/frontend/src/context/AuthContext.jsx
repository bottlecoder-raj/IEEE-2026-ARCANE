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
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
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
    try {
      const response = await authService.login(email, password)
      localStorage.setItem('token', response.token)
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
      }
      return { success: true, user: response.user }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      localStorage.setItem('token', response.token)
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
      }
      return { success: true, user: response.user }
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' }
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

