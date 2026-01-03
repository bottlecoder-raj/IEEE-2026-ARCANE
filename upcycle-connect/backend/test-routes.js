// Quick test script to verify routes are working
import app from './src/app.js'

// Test if routes are registered
console.log('Testing route registration...')

// Get all registered routes
const routes = []
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    routes.push({
      path: middleware.route.path,
      methods: Object.keys(middleware.route.methods)
    })
  } else if (middleware.name === 'router') {
    // Handle router middleware
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        routes.push({
          path: handler.route.path,
          methods: Object.keys(handler.route.methods)
        })
      }
    })
  }
})

console.log('Registered routes:', JSON.stringify(routes, null, 2))

