import supabaseClient from '../supabaseClient'
import api from './api'

export const supabaseAuth = {
  signUp: async ({ email, password }) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    })
    if (error) throw error
    return data
  },

  signIn: async ({ email, password }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  getSession: async () => {
    const { data, error } = await supabaseClient.auth.getSession()
    if (error) throw error
    return data
  },

  // After signing in on client, call this server route to ensure profile exists in DB
  syncProfile: async (token, profileData = {}) => {
    const response = await api.post('/auth/sync-profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }
}

export default supabaseAuth
