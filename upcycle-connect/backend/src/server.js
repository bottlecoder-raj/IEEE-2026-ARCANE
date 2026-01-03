import app from './app.js'
import { config } from './config/env.js'
import { isSupabaseConfigured } from './config/supabaseClient.js'

const PORT = config.port

// Start server
app.listen(PORT, () => {
  console.log(`🚀 UpCycle Connect API Server running on port ${PORT}`)
  console.log(`📍 Environment: ${config.nodeEnv}`)
  console.log(`🌐 CORS enabled for: ${config.corsOrigin}`)
  console.log(`📡 API available at: http://localhost:${PORT}/api`)
  
  // Check Supabase configuration
  if (isSupabaseConfigured()) {
    console.log(`✅ Supabase: Connected (${config.supabaseUrl})`)
    // Verify credentials (lightweight check)
    // Use dynamic import without top-level await so this works inside callback
    import('./config/supabaseClient.js')
      .then(({ verifySupabase }) => {
        verifySupabase().then(result => {
          if (!result.ok) {
            console.warn(`⚠️ Supabase verification failed: ${result.message}`)
            console.warn('   If you see "Invalid Supabase API key", set SUPABASE_SERVICE_ROLE_KEY in backend/.env to a valid service role key')
          } else {
            console.log('   Supabase verification passed')
          }
        }).catch(err => {
          console.warn('⚠️ Supabase verification error:', err.message || err)
        })
      })
      .catch(err => {
        console.warn('⚠️ Could not import supabase client for verification:', err.message || err)
      })
  } else {
    console.log(`⚠️  Supabase: Not configured (using in-memory storage)`)
    console.log(`   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env to enable database`)
  }
  
  console.log(`\n📋 Available endpoints:`)
  console.log(`   POST   /api/auth/register`)
  console.log(`   POST   /api/auth/login`)
  console.log(`   GET    /api/auth/me (protected)`)
  console.log(`   GET    /api/materials`)
  console.log(`   POST   /api/materials (protected, provider only)`)
  console.log(`   GET    /api/requests`)
  console.log(`   POST   /api/requests (protected, seeker only)`)
  console.log(`   GET    /api/impact/summary (protected)`)
  console.log(`\n✅ Server ready!\n`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err)
  // Close server gracefully
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

