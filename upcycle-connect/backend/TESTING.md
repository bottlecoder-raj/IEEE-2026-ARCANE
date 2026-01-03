# How to Test the Backend

This guide shows you multiple ways to verify that your backend is working correctly.

## Quick Start

### 1. Start the Server

```bash
cd backend
npm start
```

You should see:
```
🚀 UpCycle Connect API Server running on port 5000
📍 Environment: development
🌐 CORS enabled for: http://localhost:3000
📡 API available at: http://localhost:5000/api
✅ Supabase: Connected (https://your-project.supabase.co)
```

**Note**: If you see `⚠️ Supabase: Not configured`, the backend will still work but use in-memory storage instead of the database.

### 2. Test the Server is Running

Open your browser or use curl:
```bash
# Browser
http://localhost:5000/api/test

# curl (Windows PowerShell)
curl http://localhost:5000/api/test

# curl (Git Bash / Linux / Mac)
curl http://localhost:5000/api/test
```

Expected response:
```json
{"success":true,"message":"Test route works!"}
```

---

## Testing Methods

### Method 1: Automated Test Script (Recommended)

Run the automated test script that tests all major endpoints:

```bash
node test-backend.js
```

This script will:
- ✅ Test server connection
- ✅ Test user registration
- ✅ Test user login
- ✅ Test protected routes
- ✅ Test material creation
- ✅ Test material retrieval
- ✅ Test requests
- ✅ Test impact calculations

**Requirements**: 
- Node.js 18+ (for native `fetch` API)
- Server must be running on port 5000

---

### Method 2: Interactive HTML Tester

Open the HTML test page in your browser:

1. Start the server: `npm start`
2. Open `test-api.html` in your browser (double-click the file)
3. Use the interactive form to test endpoints

This is great for:
- Testing individual endpoints
- Seeing responses in a readable format
- Testing with different data

---

### Method 3: curl Commands

Test endpoints using curl commands:

#### Test Server
```bash
curl http://localhost:5000/api/test
```

#### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"provider\",\"location\":\"New York, NY\"}"
```

**Windows PowerShell** (use backticks for line continuation):
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"provider\",\"location\":\"New York, NY\"}'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Save the token from the response, then use it:

#### Get Current User (Protected)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get All Materials
```bash
curl http://localhost:5000/api/materials
```

#### Create Material (Protected - Provider Only)
```bash
curl -X POST http://localhost:5000/api/materials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Cotton Fabric\",\"description\":\"High quality cotton\",\"category\":\"fabric\",\"quantity\":10,\"condition\":\"excellent\",\"location\":\"New York, NY\"}"
```

---

### Method 4: Postman / Insomnia

Import these endpoints into Postman or Insomnia:

**Base URL**: `http://localhost:5000/api`

**Endpoints to test**:
1. `GET /test` - Test server
2. `POST /auth/register` - Register user
3. `POST /auth/login` - Login
4. `GET /auth/me` - Get current user (requires Authorization header)
5. `GET /materials` - Get all materials
6. `POST /materials` - Create material (requires Authorization header)
7. `GET /requests` - Get all requests
8. `GET /impact/platform` - Get platform impact

---

## Verification Checklist

### ✅ Server Status
- [ ] Server starts without errors
- [ ] `/api/test` endpoint returns success
- [ ] Server logs show correct port and environment

### ✅ Supabase Connection (if configured)
- [ ] Server logs show "✅ Supabase: Connected"
- [ ] Data persists after server restart
- [ ] Can see data in Supabase Table Editor

### ✅ Authentication
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Protected routes require valid token
- [ ] Invalid token returns 401 error

### ✅ Materials
- [ ] Can get all materials
- [ ] Can create material (as provider)
- [ ] Can get material by ID
- [ ] Can update material (as owner)
- [ ] Can delete material (as owner)

### ✅ Requests
- [ ] Can get all requests
- [ ] Can create request (as seeker)
- [ ] Can update request status
- [ ] Can delete request (as owner)

### ✅ Impact
- [ ] Can get platform impact
- [ ] Can get user impact
- [ ] Carbon calculations are correct

---

## Common Issues

### ❌ "Cannot GET /api/test"
- **Solution**: Make sure the server is running (`npm start`)
- Check if port 5000 is already in use
- Verify you're using the correct URL

### ❌ "ECONNREFUSED" or Connection Error
- **Solution**: Server is not running - start it with `npm start`
- Check if port 5000 is blocked by firewall

### ❌ "Supabase: Not configured"
- **Solution**: This is fine for testing - backend uses in-memory storage
- To use Supabase, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`

### ❌ "401 Unauthorized" on Protected Routes
- **Solution**: You need a valid JWT token
- Login first and use the token in the Authorization header
- Format: `Authorization: Bearer YOUR_TOKEN_HERE`

### ❌ "403 Forbidden" on Protected Routes
- **Solution**: Check user role permissions
- Providers can only create materials
- Seekers can only create requests

### ❌ Database Errors (if using Supabase)
- **Solution**: 
  - Verify Supabase credentials in `.env`
  - Check if database schema is created (run `database-schema.sql`)
  - Verify Supabase project is active (not paused)

---

## Next Steps

Once testing is successful:

1. ✅ Verify all endpoints work
2. ✅ Test with different user roles
3. ✅ Check data persistence (restart server)
4. ✅ Verify Supabase integration (if configured)
5. ✅ Test error handling (invalid data, missing fields, etc.)

For more details, see:
- `docs/QUICK_START.md` - Supabase setup guide
- `README.md` - API documentation
- `docs/SUPABASE_INTEGRATION.md` - Detailed integration guide

