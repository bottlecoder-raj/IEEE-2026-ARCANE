import api from './api'

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Get current authenticated user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Logout (client-side only, backend may have logout endpoint)
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Even if backend logout fails, clear local storage
      console.error('Logout error:', error)
    }
  }
}

