import { createClient } from '@supabase/supabase-js'
import { config } from './env.js'

// Initialize Supabase client with service role key for backend operations
// Service role key bypasses RLS (Row Level Security) - use carefully!
// Use placeholder values if not configured to prevent initialization errors
const supabaseUrl = config.supabaseUrl || 'https://placeholder.supabase.co'
const supabaseKey = config.supabaseServiceKey || config.supabaseKey || 'placeholder-key'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return config.supabaseUrl && 
         config.supabaseUrl !== '' && 
         config.supabaseUrl !== 'https://placeholder.supabase.co' &&
         (config.supabaseServiceKey || config.supabaseKey)
}

// Get Supabase client instance
export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null // Return null instead of throwing - services will handle fallback
  }
  return supabase
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  // Some Postgres codes
  if (error.code === '23505') { // Unique violation
    return {
      message: 'Record already exists',
      statusCode: 409
    }
  }
  if (error.code === '23503') { // Foreign key violation
    return {
      message: 'Referenced record does not exist',
      statusCode: 400
    }
  }

  // Common Supabase / auth-level errors
  const msg = (error.message || '').toString()
  if (msg.toLowerCase().includes('invalid api key') || msg.toLowerCase().includes('invalid api-key')) {
    return {
      message: 'Invalid Supabase API key. Check SUPABASE_SERVICE_ROLE_KEY in your backend .env',
      statusCode: 500
    }
  }

  return {
    message: error.message || 'Database error',
    statusCode: 500
  }
}

// Verify Supabase connection by performing a lightweight query
export const verifySupabase = async () => {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Supabase not configured (missing SUPABASE_URL or keys)' }
  }

  try {
    // Try a minimal read to validate the credentials
    const { data, error } = await supabase.from('users').select('id').limit(1).maybeSingle()
    if (error) {
      return { ok: false, message: error.message || 'Supabase query error' }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, message: err.message || 'Supabase verification failed' }
  }
}

