# Deployment Fixes - CareFacility Production Setup

## Problem Diagnosis
The application works locally but fails in production with:
```
network error: SyntaxError: JSON.parse: unexpected end of data at line 1 column 1
```

This error occurs because:
1. **Vercel (client) → Render (server) requests fail** — The client uses relative paths (`/api/auth/login`) which resolve to the Vercel origin, not the Render backend
2. **CORS blocking** — The server doesn't properly allow the Vercel domain
3. **Environment misconfiguration** — `VITE_API_URL` not set on Vercel

## Changes Applied

### 1. Fixed Client-Side API Calls
**File: `client/src/context/AuthContext.jsx`**
- Changed `fetch('/api/auth/login')` → `fetch(`${apiBase}/api/auth/login`)` 
- Changed `fetch('/api/auth/me')` → `fetch(`${apiBase}/api/auth/me`)`
- Uses `import.meta.env.VITE_API_URL` in production, empty string in development

**File: `client/src/utils/api.js`**
- Added `withCredentials: true` for CORS credential support
- Added request/response logging for debugging
- Added 30-second timeout
- Updated receipt download to use `VITE_API_URL`

### 2. Enhanced Server CORS Configuration
**File: `server/index.js`**
- Added comprehensive CORS with regex matching for Vercel domains (`.vercel.app`, `.vercel.sh`)
- Added preflight request handling (`app.options('*')`)
- Added request logging middleware to trace all incoming requests
- Better error handling with CORS-specific error responses
- Enhanced logging with timestamps, status codes, and response bodies

### 3. Environment Variable Documentation
**File: `.env.example`**
- Added detailed production deployment instructions
- Clarified VITE_API_URL format (NO trailing slash, NO /api)

## Required Environment Variables

### Render (Server) Environment:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/care_facility
CLIENT_URL=https://your-domain.vercel.app
JWT_SECRET=<strong_secret_key>
NODE_ENV=production
PORT=5000
ALERT_CRON=0 0 * * *
```

### Vercel (Client) Environment:
```
VITE_API_URL=https://your-render-backend.onrender.com
```

**CRITICAL:** The `VITE_API_URL` must be:
- The exact Render backend URL (e.g., `https://carefacility-backend.onrender.com`)
- **NO** trailing slash
- **NO** `/api` path
- Must use HTTPS

## Verification Steps

### 1. Test Local Development
```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client && npm run dev
```
Login should work at `http://localhost:5173`

### 2. Test Production Build Locally
```bash
# Terminal 1: Start server
cd server && NODE_ENV=production node index.js

# Terminal 2: Start client
cd client && npm run build && npm run preview
```

### 3. Deploy to Render
1. Connect your GitHub repository
2. Set environment variables in Render dashboard:
   - Go to Environment → Environment Variables
   - Add all required variables (see above)
3. Ensure auto-deploy is enabled

### 4. Deploy to Vercel
1. Import project from GitHub
2. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-render-backend.onrender.com`
3. Build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

### 5. Verify Production Login
1. Open browser dev tools (F12)
2. Go to Network tab
3. Attempt login
4. Check:
   - Request URL should be `https://your-render-backend.onrender.com/api/auth/login`
   - Response status should be 200
   - Response should contain JSON with `success: true`
   - CORS headers should be present

## Troubleshooting

### Issue: "Network Error" or CORS blocked
- Check that `VITE_API_URL` is set correctly on Vercel
- Ensure Render `CLIENT_URL` includes the Vercel domain
- Verify Render backend is running (check Render logs)

### Issue: Empty response / JSON parse error
- Check server logs on Render for errors
- Verify MongoDB connection string is correct
- Ensure `JWT_SECRET` is set on Render

### Issue: Login successful but redirected back to login
- Check that tokens are being stored in localStorage
- Verify `/api/auth/me` endpoint returns user data
- Check CORS credentials are enabled

### Issue: Mixed content warnings
- Ensure both Vercel and Render use HTTPS
- Update all URLs to use HTTPS

## Server Logs
The updated `server/index.js` includes request logging. Check Render logs for:
```
[2026-05-06T21:42:35.123Z] POST /api/auth/login - Incoming
[2026-05-06T21:42:35.456Z] POST /api/auth/login 🟢 200 45ms
```

## API Test Commands

Test the backend directly:
```bash
# Health check
curl https://your-render-backend.onrender.com/api/health

# Test login
curl -X POST https://your-render-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@carefacility.com","password":"password123"}'
```

## Security Notes
- All production endpoints require HTTPS
- JWT tokens are HttpOnly-capable (currently in localStorage for SPA)
- CORS restricts origins to known domains
- Passwords are hashed with bcrypt before storage
- Rate limiting should be added for production (TODO)