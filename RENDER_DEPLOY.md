# Deploying FanHouse to Render

This guide will help you deploy the FanHouse platform to Render.

## Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. A GitHub repository with your code
3. Stripe account (for payments)
4. Ably account (optional, for real-time features)

## Deployment Steps

### Option 1: Using Render Blueprint (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create a new Blueprint on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Review the services and click "Apply"

3. **Configure Environment Variables**
   After the services are created, you need to set environment variables:

   **Backend Service (`fanhouse-backend`):**
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (get from [Stripe Dashboard](https://dashboard.stripe.com))
   - `ABLY_API_KEY`: Your Ably API key (optional)
   - `KNOCK_API_KEY`: Your Knock API key (optional)
   - `PERSONA_API_KEY`: Your Persona API key (optional)
   - `JWT_SECRET`: A strong random string (Render will auto-generate, but you can set your own)

   **Frontend Service (`fanhouse-frontend`):**
   - `NEXT_PUBLIC_ABLY_KEY`: Your Ably public key (optional)

4. **Wait for Deployment**
   - Render will build and deploy all services
   - This may take 5-10 minutes
   - Check the logs for any errors

5. **Initialize Database**
   - The backend will automatically initialize the database schema on first start
   - Check backend logs to confirm: "Database schema initialized successfully"

6. **Create Admin User**
   - SSH into the backend service or use Render Shell
   - Run: `npm run create-admin`
   - Or use the reset script: `npm run reset-admin admin@fanhouse.com admin123`

### Option 2: Manual Service Creation

If you prefer to create services manually:

#### 1. Create PostgreSQL Database
- Go to "New +" → "PostgreSQL"
- Name: `fanhouse-db`
- Plan: Starter (free tier)
- Region: Choose closest to you
- Note the **Internal Database URL** (you'll need this)

#### 2. Create Redis Instance
- Go to "New +" → "Redis"
- Name: `fanhouse-redis`
- Plan: Starter (free tier)
- Region: Same as database
- Note the **Internal Redis URL**

#### 3. Create Backend Web Service
- Go to "New +" → "Web Service"
- Connect your GitHub repository
- Settings:
  - **Name**: `fanhouse-backend`
  - **Environment**: Docker
  - **Dockerfile Path**: `./backend/Dockerfile`
  - **Docker Context**: `./backend`
  - **Build Command**: (leave empty, handled by Dockerfile)
  - **Start Command**: (leave empty, handled by Dockerfile)
  - **Plan**: Starter

- **Environment Variables**:
  ```
  NODE_ENV=production
  PORT=3001
  DATABASE_URL=<from database service>
  REDIS_URL=<from redis service>
  JWT_SECRET=<generate a strong random string>
  FRONTEND_URL=<will be set after frontend deploys>
  STRIPE_SECRET_KEY=<your-stripe-secret-key>
  ABLY_API_KEY=<optional>
  KNOCK_API_KEY=<optional>
  PERSONA_API_KEY=<optional>
  UPLOAD_DIR=/app/uploads
  ```

#### 4. Create Frontend Web Service
- Go to "New +" → "Web Service"
- Connect your GitHub repository
- Settings:
  - **Name**: `fanhouse-frontend`
  - **Environment**: Docker
  - **Dockerfile Path**: `./frontend/Dockerfile`
  - **Docker Context**: `./frontend`
  - **Plan**: Starter

- **Environment Variables**:
  ```
  NODE_ENV=production
  NEXT_PUBLIC_API_URL=https://fanhouse-backend.onrender.com
  NEXT_PUBLIC_ABLY_KEY=<optional>
  ```

#### 5. Update Backend with Frontend URL
- After frontend deploys, update backend's `FRONTEND_URL`:
  ```
  FRONTEND_URL=https://fanhouse-frontend.onrender.com
  ```

## Post-Deployment Setup

### 1. Create Admin User
```bash
# Using Render Shell (from backend service)
npm run create-admin
# Or reset password
npm run reset-admin admin@fanhouse.com admin123
```

### 2. Update Stripe Webhooks (if using)
- Go to Stripe Dashboard → Webhooks
- Add endpoint: `https://fanhouse-backend.onrender.com/api/payment/webhook`
- Select events: `checkout.session.completed`, `payment_intent.succeeded`

### 3. Test the Application
- Visit your frontend URL: `https://fanhouse-frontend.onrender.com`
- Test login/register
- Test subscription flow
- Test PPV unlock

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for production

### Database Migrations
- The backend automatically runs schema initialization on startup
- For manual migrations, use: `npm run migrate` in backend service

### File Uploads
- Uploads are stored in container filesystem (ephemeral)
- For production, consider using:
  - AWS S3
  - Cloudinary
  - Render Disk (paid feature)

### Environment Variables
- Never commit secrets to Git
- Use Render's environment variable management
- Mark sensitive variables as "Secret"

## Troubleshooting

### Backend won't start
- Check logs for database connection errors
- Verify `DATABASE_URL` is correct
- Ensure database is running

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend service is running

### Database connection issues
- Use **Internal Database URL** (not public URL) for backend
- Verify database is in same region
- Check database credentials

### Build failures
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check build logs for specific errors

## Cost Estimation

**Free Tier:**
- Backend: Free (with limitations)
- Frontend: Free (with limitations)
- PostgreSQL: Free (90 days, then $7/month)
- Redis: Free (with limitations)

**Starter Plan (Recommended for Production):**
- Backend: $7/month
- Frontend: $7/month
- PostgreSQL: $7/month
- Redis: $10/month
- **Total: ~$31/month**

## Support

For issues:
1. Check Render logs
2. Check service health status
3. Review Render documentation: https://render.com/docs
4. Check application logs in Render dashboard

