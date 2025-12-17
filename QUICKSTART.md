# Quick Start Guide

Get FanHouse running in 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repo)

## Steps

1. **Start all services**
   ```bash
   docker-compose up
   ```

2. **Wait for services to be ready**
   - PostgreSQL: ~10 seconds
   - Backend: ~30 seconds (database initialization)
   - Frontend: ~30 seconds

3. **Create an admin user** (in a new terminal)
   ```bash
   docker-compose exec backend npm run create-admin
   ```
   Or manually:
   ```bash
   docker-compose exec backend npm run create-admin admin@fanhouse.com admin123
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Test the Flow

1. **Register as Fan**
   - Go to http://localhost:3000/register
   - Create account with role "Fan"

2. **Apply as Creator**
   - Login as fan
   - Go to Creator Dashboard
   - Click "Apply as Creator"

3. **Approve Creator (Admin)**
   - Login as admin (admin@fanhouse.com / admin123)
   - Go to /admin
   - Find pending creator and click "Approve"

4. **Create Content**
   - Login as approved creator
   - Click "Create Post"
   - Upload media, set access type, create post

5. **Subscribe and View**
   - Login as fan
   - Go to /creators
   - Subscribe to a creator
   - Go to /feed to see subscriber-only content

6. **Unlock PPV**
   - Creator creates PPV post
   - Fan sees locked content in feed
   - Click "Unlock" and pay (mocked)

## Troubleshooting

**Services won't start?**
- Check if ports 3000, 3001, 5432, 6379 are available
- Check Docker logs: `docker-compose logs`

**Database connection errors?**
- Wait a bit longer for PostgreSQL to initialize
- Check: `docker-compose logs postgres`

**Frontend can't connect to backend?**
- Ensure backend is running: http://localhost:3001/health
- Check CORS settings in backend

**Real-time features not working?**
- Ably key not required for basic functionality
- Add `NEXT_PUBLIC_ABLY_KEY` to frontend/.env.local for real-time
- Add `ABLY_API_KEY` to backend/.env for publishing events

## Environment Variables

Optional but recommended:
- `ABLY_API_KEY` - For real-time features
- `KNOCK_API_KEY` - For notifications (mocked currently)
- `PERSONA_API_KEY` - For verification (mocked currently)

## Next Steps

- Read the full README.md for detailed documentation
- Check ARCHITECTURE.md for design decisions
- Explore the codebase to understand the implementation

