# Fix for Render Deployment Connection Issues

## Problem
Frontend can't connect to backend - showing `ERR_CONNECTION_REFUSED` errors.

## Solution

### Step 1: Verify Backend is Running
1. Go to Render Dashboard
2. Check `fanhouse-backend` service status
3. Verify it shows "Live" or "Deployed"
4. Check the backend URL (should be something like `https://fanhouse-backend.onrender.com`)

### Step 2: Manually Set Frontend Environment Variable
The `fromService` property might not include the `https://` protocol. You need to manually set it:

1. Go to Render Dashboard → `fanhouse-frontend` service
2. Go to **Environment** tab
3. Find `NEXT_PUBLIC_API_URL`
4. Update it to the full backend URL:
   ```
   https://fanhouse-backend.onrender.com
   ```
   (Replace `fanhouse-backend` with your actual backend service name if different)

5. Click **Save Changes**
6. Render will automatically redeploy the frontend

### Step 3: Verify Backend is Accessible
Test the backend health endpoint:
```
https://fanhouse-backend.onrender.com/health
```

Should return: `{"status":"ok","database":"connected"}`

### Step 4: Test Frontend
After the frontend redeploys, try registering/login again.

## Alternative: Update render.yaml
If you want to hardcode the URL (not recommended for multiple environments), you can update `render.yaml`:

```yaml
- key: NEXT_PUBLIC_API_URL
  value: https://fanhouse-backend.onrender.com
```

Then redeploy the Blueprint.

## Common Issues

1. **Backend not deployed**: Make sure backend service is "Live"
2. **Wrong URL**: Check the exact backend service name in Render
3. **CORS errors**: Backend CORS is configured to allow all origins, so this shouldn't be an issue
4. **Database connection**: Check backend logs for database connection errors

