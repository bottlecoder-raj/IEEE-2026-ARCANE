// Quick test script to verify backend is working
// Run with: node test-backend.js

const API_BASE = 'http://localhost:5000/api'

async function testEndpoint(method, endpoint, data = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options)
    const result = await response.json()
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function runTests() {
  console.log('🧪 Testing UpCycle Connect Backend API\n')
  console.log('=' .repeat(50))
  
  // Test 1: Server is running
  console.log('\n1. Testing server connection...')
  const testResult = await testEndpoint('GET', '/test')
  if (testResult.success) {
    console.log('✅ Server is running!')
    console.log(`   Response: ${JSON.stringify(testResult.data)}`)
  } else {
    console.log('❌ Server is not responding!')
    console.log('   Make sure the server is running: npm start')
    process.exit(1)
  }
  
  // Test 2: Register a user
  console.log('\n2. Testing user registration...')
  const registerData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`, // Unique email
    password: 'password123',
    role: 'provider',
    location: 'New York, NY'
  }
  const registerResult = await testEndpoint('POST', '/auth/register', registerData)
  if (registerResult.success) {
    console.log('✅ User registered successfully!')
    console.log(`   User ID: ${registerResult.data.user?.id}`)
    console.log(`   Email: ${registerResult.data.user?.email}`)
    const authToken = registerResult.data.token
    const userId = registerResult.data.user?.id
    
    // Test 3: Login
    console.log('\n3. Testing user login...')
    const loginResult = await testEndpoint('POST', '/auth/login', {
      email: registerData.email,
      password: registerData.password
    })
    if (loginResult.success) {
      console.log('✅ Login successful!')
      const loginToken = loginResult.data.token
      
      // Test 4: Get current user (protected route)
      console.log('\n4. Testing protected route (/api/auth/me)...')
      const meResult = await testEndpoint('GET', '/auth/me', null, loginToken)
      if (meResult.success) {
        console.log('✅ Protected route works!')
        console.log(`   User: ${meResult.data.user?.name} (${meResult.data.user?.role})`)
      } else {
        console.log('❌ Protected route failed!')
        console.log(`   Error: ${JSON.stringify(meResult.data || meResult.error)}`)
      }
      
      // Test 5: Create a material (provider only)
      console.log('\n5. Testing create material (provider only)...')
      const materialData = {
        name: 'Test Fabric',
        description: 'High quality cotton fabric for testing',
        category: 'fabric',
        quantity: 10,
        condition: 'excellent',
        location: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060
      }
      const materialResult = await testEndpoint('POST', '/materials', materialData, loginToken)
      if (materialResult.success) {
        console.log('✅ Material created successfully!')
        console.log(`   Material ID: ${materialResult.data.material?.id}`)
        const materialId = materialResult.data.material?.id
        
        // Test 6: Get all materials
        console.log('\n6. Testing get all materials...')
        const materialsResult = await testEndpoint('GET', '/materials')
        if (materialsResult.success) {
          console.log('✅ Materials retrieved!')
          console.log(`   Total materials: ${materialsResult.data.materials?.length || 0}`)
        } else {
          console.log('❌ Failed to get materials')
        }
        
        // Test 7: Get material by ID
        console.log('\n7. Testing get material by ID...')
        const materialByIdResult = await testEndpoint('GET', `/materials/${materialId}`)
        if (materialByIdResult.success) {
          console.log('✅ Material retrieved by ID!')
          console.log(`   Material: ${materialByIdResult.data.material?.name}`)
        } else {
          console.log('❌ Failed to get material by ID')
        }
      } else {
        console.log('❌ Failed to create material')
        console.log(`   Error: ${JSON.stringify(materialResult.data || materialResult.error)}`)
      }
    } else {
      console.log('❌ Login failed!')
      console.log(`   Error: ${JSON.stringify(loginResult.data || loginResult.error)}`)
    }
  } else {
    console.log('❌ Registration failed!')
    console.log(`   Error: ${JSON.stringify(registerResult.data || registerResult.error)}`)
    if (registerResult.data?.message?.includes('already exists')) {
      console.log('   (This is expected if the email already exists)')
    }
  }
  
  // Test 8: Get all requests
  console.log('\n8. Testing get all requests...')
  const requestsResult = await testEndpoint('GET', '/requests')
  if (requestsResult.success) {
    console.log('✅ Requests retrieved!')
    console.log(`   Total requests: ${requestsResult.data.requests?.length || 0}`)
  } else {
    console.log('❌ Failed to get requests')
  }
  
  // Test 9: Platform impact
  console.log('\n9. Testing platform impact...')
  const impactResult = await testEndpoint('GET', '/impact/platform')
  if (impactResult.success) {
    console.log('✅ Platform impact retrieved!')
    console.log(`   Total carbon saved: ${impactResult.data.totalCarbonSaved} kg`)
    console.log(`   Total materials: ${impactResult.data.totalMaterialsRecycled}`)
  } else {
    console.log('❌ Failed to get platform impact')
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('\n✅ Backend testing complete!')
  console.log('\n💡 Tips:')
  console.log('   - Check server console for Supabase connection status')
  console.log('   - Use test-api.html in browser for interactive testing')
  console.log('   - Check Supabase dashboard to verify data is being stored')
  console.log('')
}

// Run tests
runTests().catch(console.error)

