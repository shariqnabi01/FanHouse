# FanHouse - Test Credentials

## Pre-Created Accounts

### Admin Account
- **Email:** `admin@fanhouse.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Full admin panel at `/admin`

**Note:** This account is created automatically when you run:
```bash
docker-compose exec backend npm run create-admin
```

Or reset the password with:
```bash
docker-compose exec backend npm run reset-admin admin@fanhouse.com admin123
```

---

## Test Accounts (Create via Registration)

### Fan Account
- **Email:** `fan@test.com`
- **Password:** `password123`
- **Role:** Fan
- **Access:** Feed at `/feed`, browse creators at `/creators`

**To Create:**
1. Go to http://localhost:3000/register
2. Fill in:
   - Email: `fan@test.com`
   - Username: `testfan` (optional)
   - Password: `password123`
   - Account Type: **Fan**
3. Click "Register"

### Creator Account
- **Email:** `creator@test.com`
- **Password:** `password123`
- **Role:** Creator
- **Access:** Creator dashboard at `/creator`

**To Create:**
1. Go to http://localhost:3000/register
2. Fill in:
   - Email: `creator@test.com`
   - Username: `testcreator` (optional)
   - Password: `password123`
   - Account Type: **Creator**
3. Click "Register"
4. **Important:** After registration, you need to:
   - Click "Apply as Creator" on the creator dashboard
   - Wait for admin approval (login as admin and approve at `/admin`)

---

## Quick Setup Script

You can also create test accounts via API:

### Create Fan Account
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fan@test.com",
    "password": "password123",
    "username": "testfan",
    "role": "fan"
  }'
```

### Create Creator Account
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "password123",
    "username": "testcreator",
    "role": "creator"
  }'
```

### Approve Creator (as Admin)
1. Login as admin: `admin@fanhouse.com` / `admin123`
2. Go to `/admin`
3. Click "Creators" tab
4. Find `creator@test.com`
5. Click "Approve"

---

## Complete Testing Flow

### 1. Admin Login
- URL: http://localhost:3000/login
- Email: `admin@fanhouse.com`
- Password: `admin123`
- Access: `/admin` panel

### 2. Fan Registration & Testing
- Register: `/register` → Use `fan@test.com` / `password123`
- Login: `/login` → Use `fan@test.com` / `password123`
- Browse creators: `/creators`
- View feed: `/feed`
- Subscribe to creators: Click "Subscribe" on `/creators` page

### 3. Creator Registration & Testing
- Register: `/register` → Use `creator@test.com` / `password123`
- Apply: Go to `/creator` → Click "Apply as Creator"
- Get approved: Login as admin → `/admin` → Approve creator
- Create posts: `/creator` → "Create Post"
- View posts: `/creator` → "Your Posts"

---

## Database Credentials (PostgreSQL)

- **Host:** `localhost` (or `postgres` in Docker)
- **Port:** `5432`
- **Database:** `fanhouse`
- **Username:** `fanhouse`
- **Password:** `fanhouse_dev`

**Connection String:**
```
postgresql://fanhouse:fanhouse_dev@localhost:5432/fanhouse
```

---

## Notes

1. **Admin account** is the only pre-created account. All other accounts must be registered.

2. **Creator accounts** need admin approval before they can:
   - Create posts
   - Monetize content
   - Appear in the creators list

3. **Password requirements:**
   - Minimum length enforced by frontend
   - Stored as bcrypt hash in database

4. **Role-based access:**
   - Fans can only access `/feed` and `/creators`
   - Creators can only access `/creator` dashboard
   - Admins can access `/admin` panel

5. **For production:** Change all default passwords immediately!

---

## Troubleshooting

**Can't login as admin?**
```bash
# Reset admin password
docker-compose exec backend npm run reset-admin admin@fanhouse.com admin123
```

**Can't see creators?**
- Make sure creator is approved (check `/admin` → Creators tab)

**Can't create posts as creator?**
- Make sure your creator application is approved
- Check status at `/creator` dashboard

**Forgot password?**
- Currently no password reset feature
- Use the reset script for admin: `npm run reset-admin`
- For other users, you'll need to update the database directly

