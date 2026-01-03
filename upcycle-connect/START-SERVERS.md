# 🚀 Quick Start Guide - Fix Network Errors

## The Problem
**"Network Error"** when registering/logging in = **Backend server is NOT running**

## The Solution

### Step 1: Start Backend Server

1. Open a **new terminal/command prompt**
2. Navigate to backend folder:
   ```bash
   cd "d:\Arnav\arcane -2\IEEE-2026-ARCANE\upcycle-connect\backend"
   ```
3. Start the backend:
   ```bash
   npm start
   ```
4. **Wait for this message:**
   ```
   🚀 UpCycle Connect API Server running on port 5000
   ✅ Server ready!
   ```
5. **Keep this terminal open!** (Don't close it)

---

### Step 2: Verify Backend is Running

Open your browser and go to:
```
http://localhost:5000/api/test
```

You should see:
```json
{"success":true,"message":"Test route works!"}
```

✅ If you see this, backend is working!

---

### Step 3: Start Frontend (if not already running)

1. Open a **second terminal/command prompt**
2. Navigate to frontend folder:
   ```bash
   cd "d:\Arnav\arcane -2\IEEE-2026-ARCANE\upcycle-connect\frontend"
   ```
3. Start frontend:
   ```bash
   npm run dev
   ```

---

### Step 4: Try Registering/Logging In Again

Now go back to your browser at `http://localhost:3000` and try registering/login again.

**It should work now!** ✅

---

## Summary

**You need TWO terminals running:**

1. **Terminal 1**: Backend server (`npm start` in backend folder)
2. **Terminal 2**: Frontend server (`npm run dev` in frontend folder)

**Both must be running at the same time!**

---

## Quick Commands

### Windows PowerShell:
```powershell
# Terminal 1 - Backend
cd "d:\Arnav\arcane -2\IEEE-2026-ARCANE\upcycle-connect\backend"
npm start

# Terminal 2 - Frontend (new terminal window)
cd "d:\Arnav\arcane -2\IEEE-2026-ARCANE\upcycle-connect\frontend"
npm run dev
```

### If backend doesn't start:
```bash
cd backend
npm install  # Install dependencies first
npm start
```

---

## Still Having Issues?

1. Check backend terminal for error messages
2. Make sure port 5000 is not already in use
3. Check browser console (F12) for detailed error
4. See `TROUBLESHOOTING.md` for more help

