# Troubleshooting Network Errors

## "Network Error" when Registering/Logging In

This usually means the **backend server is not running** or not accessible.

### Quick Fix Steps:

1. **Check if backend is running:**
   ```bash
   # In a terminal, navigate to backend folder
   cd backend
   
   # Start the backend server
   npm start
   ```

2. **You should see:**
   ```
   🚀 UpCycle Connect API Server running on port 5000
   ✅ Supabase: Connected (or ⚠️ Not configured)
   ✅ Server ready!
   ```

3. **Test backend is working:**
   - Open browser: `http://localhost:5000/api/test`
   - Should see: `{"success":true,"message":"Test route works!"}`

4. **Keep backend running** - Don't close the terminal!

5. **Then start frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

---

## Common Issues & Solutions

### ❌ Issue 1: "ERR_NETWORK" or "Network Error"

**Cause**: Backend server is not running

**Solution**:
1. Open a new terminal/command prompt
2. Navigate to backend folder: `cd backend`
3. Run: `npm start`
4. Wait for "✅ Server ready!" message
5. Keep this terminal open (don't close it!)
6. Try registering/login again

---

### ❌ Issue 2: "Cannot connect to localhost:5000"

**Cause**: Backend is not running or port 5000 is blocked

**Solution**:
1. Check if backend is running (see Issue 1)
2. Check if port 5000 is in use:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :5000
   
   # If something is using port 5000, you'll see output
   # Kill that process or use a different port
   ```
3. Try changing backend port in `backend/.env`:
   ```
   PORT=5001
   ```
   Then update frontend `vite.config.js` proxy target to `http://localhost:5001`

---

### ❌ Issue 3: "CORS Error" or "Access-Control-Allow-Origin"

**Cause**: CORS not properly configured

**Solution**:
1. Check `backend/src/config/env.js` - `corsOrigin` should be `http://localhost:3000`
2. Or set in `backend/.env`:
   ```
   CORS_ORIGIN=http://localhost:3000
   ```
3. Restart backend server after changing `.env`

---

### ❌ Issue 4: Backend starts but crashes immediately

**Cause**: Missing dependencies or configuration errors

**Solution**:
1. Check terminal for error messages
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Check for missing `.env` file (backend should work without it, but check)
4. Look at the error message in the terminal

---

### ❌ Issue 5: Frontend shows network error but backend seems fine

**Cause**: Frontend is using wrong API URL or proxy not working

**Solution**:
1. Check browser console (F12) for exact error
2. Check `frontend/src/services/api.js` - API_BASE_URL should be `http://localhost:5000/api`
3. Check `frontend/vite.config.js` - proxy should target `http://localhost:5000`
4. Try accessing backend directly: `http://localhost:5000/api/test`
5. Restart frontend dev server after changes

---

## Step-by-Step: Starting Both Servers

### Terminal 1 - Backend:
```bash
cd "d:\Arnav\arcane -2\IEEE-2026-ARCANE\upcycle-connect\backend"
npm start
```
✅ Wait for: "✅ Server ready!"

### Terminal 2 - Frontend:
```bash
cd "d:\Arnav\arcane -2\IEEE-2026-ARCANE\upcycle-connect\frontend"
npm run dev
```
✅ Wait for: "Local: http://localhost:3000"

### Then:
1. Open browser to `http://localhost:3000`
2. Try registering/login
3. Should work now! ✅

---

## Quick Verification Checklist

- [ ] Backend server is running (check terminal)
- [ ] Backend shows "✅ Server ready!" message
- [ ] `http://localhost:5000/api/test` works in browser
- [ ] Frontend dev server is running (check terminal)
- [ ] Frontend shows "Local: http://localhost:3000"
- [ ] No errors in backend terminal
- [ ] No errors in frontend terminal
- [ ] Browser console (F12) shows no CORS errors

---

## Still Not Working?

1. **Check backend terminal for errors** - copy the error message
2. **Check browser console (F12)** - look for network errors
3. **Test backend directly**: `http://localhost:5000/api/test`
4. **Check ports are not blocked by firewall**
5. **Try restarting both servers**
6. **Check Node.js version**: `node --version` (should be 16+)

---

## Need More Help?

Check these files for configuration:
- `backend/src/config/env.js` - Backend configuration
- `backend/.env` - Backend environment variables (optional)
- `frontend/src/services/api.js` - Frontend API configuration
- `frontend/vite.config.js` - Frontend dev server configuration

