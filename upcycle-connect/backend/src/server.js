import app from './app.js'
import { config } from './config/env.js'

const PORT = config.port

// Start server
app.listen(PORT, () => {
  console.log(`🚀 UpCycle Connect API Server running on port ${PORT}`)
  console.log(`📍 Environment: ${config.nodeEnv}`)
  console.log(`🌐 CORS enabled for: ${config.corsOrigin}`)
  console.log(`📡 API available at: http://localhost:${PORT}/api`)
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

