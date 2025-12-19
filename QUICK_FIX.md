# Quick Fix for Connection Refused Error

## Step 1: Verify Backend is Running
Test the backend directly in your browser:
```
https://fanhouse-backend.onrender.com/health
```

**Expected response:**
```json
{"status":"ok","database":"connected"}
```

If this doesn't work, the backend isn't running or accessible.

## Step 2: Verify Environment Variable is Set
1. Go to Render Dashboard → `fanhouse-frontend` → Environment
2. Check `NEXT_PUBLIC_API_URL` value
3. It should be: `https://fanhouse-backend.onrender.com`
4. **Important:** Make sure there's NO trailing slash

## Step 3: Force Frontend Redeploy
After updating the environment variable:
1. Go to `fanhouse-frontend` service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete (2-3 minutes)

## Step 4: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

## Step 5: Check Network Tab
1. Open DevTools → Network tab
2. Try to login again
3. Click on the failed "login" request
4. Check the "Request URL" - it should show:
   ```
   https://fanhouse-backend.onrender.com/api/auth/login
   ```
   NOT:
   ```
   http://localhost:3001/api/auth/login
   ```

## Step 6: Check Backend Logs
1. Go to Render Dashboard → `fanhouse-backend` → Logs
2. Look for errors or connection issues
3. Check if database is connected

## Common Issues:

### Issue 1: Environment Variable Not Applied
**Solution:** The frontend needs to be rebuilt after env var changes. Use "Manual Deploy" to force a rebuild.

### Issue 2: Backend Not Running
**Solution:** Check backend service status. If it's "Suspended", click "Resume".

### Issue 3: Wrong Backend URL
**Solution:** Verify the exact backend service name in Render. It might be different from `fanhouse-backend`.

### Issue 4: CORS Error (Different from Connection Refused)
**Solution:** Backend CORS is configured to allow all origins, so this shouldn't be an issue.

## Still Not Working?
1. Check the exact backend service name in Render
2. Verify both services are in the same region
3. Check if there are any firewall/network restrictions
4. Try accessing the backend health endpoint directly

