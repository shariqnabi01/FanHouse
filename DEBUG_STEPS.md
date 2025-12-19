# Debug Steps for Connection Refused

## Step 1: Check Browser Console
1. Open the login page
2. Open DevTools (F12) → Console tab
3. Look for: `[API] Using API URL: ...`
4. This will show what URL the frontend is actually using

## Step 2: Verify Backend is Accessible
Test directly in browser:
```
https://fanhouse-backend.onrender.com/health
```

Should return: `{"status":"ok","database":"connected"}`

## Step 3: Check Environment Variable in Render
1. Go to Render Dashboard → `fanhouse-frontend` → Environment
2. Verify `NEXT_PUBLIC_API_URL` is set to: `https://fanhouse-backend.onrender.com`
3. **Important:** Make sure there's NO trailing slash

## Step 4: Check Build Logs
1. Go to Render Dashboard → `fanhouse-frontend` → Logs
2. Look for the build logs
3. Check if `NEXT_PUBLIC_API_URL` is mentioned or if there are any errors

## Step 5: Force Complete Rebuild
1. Go to `fanhouse-frontend` service
2. Click "Settings" → Scroll to bottom
3. Click "Clear build cache"
4. Then click "Manual Deploy" → "Deploy latest commit"

## Step 6: Alternative - Hardcode for Testing
If the env var still doesn't work, we can temporarily hardcode it in the code to test if the backend is accessible.

## Step 7: Check Network Tab
1. Open DevTools → Network tab
2. Try to login
3. Click on the failed request
4. Check the "Request URL" - what does it show?

## Common Issues:

### Issue: Env var not available at build time
**Solution:** Render should pass env vars during build, but sometimes you need to clear cache and rebuild.

### Issue: Wrong backend URL
**Solution:** Verify the exact backend service name. It might be different from `fanhouse-backend`.

### Issue: Backend not running
**Solution:** Check backend service status. Free tier services spin down after 15 min inactivity.

