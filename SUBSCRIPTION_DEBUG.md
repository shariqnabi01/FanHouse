# Debugging Subscription 500 Error

## Common Causes

Since it was working before, the issue is likely:

### 1. Database Connection Issue
- Check backend logs in Render Dashboard
- Verify database is connected
- Test: `https://fanhouse-backend.onrender.com/health`

### 2. Missing Environment Variable
- `FRONTEND_URL` might not be set correctly
- Check in Render Dashboard → `fanhouse-backend` → Environment
- Should be: `https://fanhouse-frontend.onrender.com`

### 3. Database Schema Issue
- Tables might not exist or have wrong structure
- Check backend logs for SQL errors

### 4. Ably/Event Publishing Issue
- If Ably is not configured, `publishEvent` might fail
- Check if `ABLY_API_KEY` is set (optional, but if set incorrectly can cause issues)

## How to Debug

### Step 1: Check Backend Logs
1. Go to Render Dashboard → `fanhouse-backend` → Logs
2. Look for errors around the time of the subscription attempt
3. Look for:
   - Database connection errors
   - SQL syntax errors
   - Missing table errors
   - Environment variable errors

### Step 2: Test Backend Health
```
https://fanhouse-backend.onrender.com/health
```
Should return: `{"status":"ok","database":"connected"}`

### Step 3: Check Environment Variables
In Render Dashboard → `fanhouse-backend` → Environment:
- `FRONTEND_URL` should be: `https://fanhouse-frontend.onrender.com`
- `DATABASE_URL` should be set (auto-set from database)
- `JWT_SECRET` should be set

### Step 4: Verify Database Schema
The backend should auto-initialize the schema on startup. Check logs for:
- "Database schema initialized successfully"
- Any schema errors

## Quick Fix

If the issue persists, try:

1. **Restart Backend Service**
   - Render Dashboard → `fanhouse-backend` → Manual Deploy → Deploy latest commit

2. **Check Database Connection**
   - Verify the database service is running
   - Check if database URL is correct

3. **Verify Creator Exists**
   - Make sure the creator you're trying to subscribe to exists
   - Make sure the creator is approved

## If Still Not Working

Check the exact error in backend logs and share it for further debugging.

