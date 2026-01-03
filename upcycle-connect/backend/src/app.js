import express from 'express'
import cors from 'cors'
import { config } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'

// Import routes
import authRoutes from './routes/auth.routes.js'
import materialRoutes from './routes/material.routes.js'
import requestRoutes from './routes/request.routes.js'
import impactRoutes from './routes/impact.routes.js'

const app = express()

// Middleware
const allowedOrigins = (config.corsOrigin || '').split(',').map(o => o.trim()).filter(Boolean)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl or Postman)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'UpCycle Connect API is running',
    timestamp: new Date().toISOString()
  })
})

// Base API endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'UpCycle Connect API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      materials: '/api/materials',
      requests: '/api/requests',
      impact: '/api/impact'
    },
    documentation: 'See README.md for API documentation',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/materials', materialRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/impact', impactRoutes)

// Debug: Test route to verify routing works
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test route works!' })
})

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

export default app

