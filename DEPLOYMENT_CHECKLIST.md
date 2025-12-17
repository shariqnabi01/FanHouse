# Deployment Checklist for Render

## Pre-Deployment

- [ ] Push all code to GitHub
- [ ] Test locally with Docker
- [ ] Verify all environment variables are documented
- [ ] Remove any hardcoded localhost URLs
- [ ] Update CORS settings if needed

## Render Setup

- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Create Blueprint from `render.yaml` OR create services manually

## Environment Variables

### Backend Service
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `DATABASE_URL` (auto-set from database)
- [ ] `REDIS_URL` (set manually after Redis creation)
- [ ] `JWT_SECRET` (auto-generated, or set your own)
- [ ] `FRONTEND_URL` (set after frontend deploys)
- [ ] `STRIPE_SECRET_KEY` (your Stripe secret key)
- [ ] `ABLY_API_KEY` (optional)
- [ ] `KNOCK_API_KEY` (optional)
- [ ] `PERSONA_API_KEY` (optional)
- [ ] `UPLOAD_DIR=/app/uploads`

### Frontend Service
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_API_URL` (backend URL, e.g., `https://fanhouse-backend.onrender.com`)
- [ ] `NEXT_PUBLIC_ABLY_KEY` (optional)

## Post-Deployment

- [ ] Verify backend health check: `https://fanhouse-backend.onrender.com/health`
- [ ] Verify frontend loads: `https://fanhouse-frontend.onrender.com`
- [ ] Test user registration
- [ ] Test user login
- [ ] Create admin user via Render Shell
- [ ] Test creator application flow
- [ ] Test subscription flow
- [ ] Test PPV unlock flow
- [ ] Verify Stripe integration (if configured)
- [ ] Test file uploads
- [ ] Check database schema initialization

## Important Notes

1. **Redis**: Create manually in Render dashboard (not supported in render.yaml)
2. **Database**: Use Internal Database URL (not public URL)
3. **Frontend URL**: Update backend's `FRONTEND_URL` after frontend deploys
4. **File Uploads**: Currently stored in container (ephemeral). Consider S3/Cloudinary for production
5. **Free Tier**: Services spin down after 15 min inactivity

## Troubleshooting

- Check service logs in Render dashboard
- Verify environment variables are set correctly
- Ensure database is running and accessible
- Check CORS settings if frontend can't connect
- Verify health check endpoints

