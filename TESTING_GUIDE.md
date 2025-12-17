# Complete UI Testing Guide

This guide walks you through testing all features of the FanHouse application.

## Prerequisites

1. Ensure all services are running:
   ```bash
   docker-compose ps
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Test Accounts

**Admin User** (pre-created):
- Email: `admin@fanhouse.com`
- Password: `admin123`

## Complete Testing Flow

### 1. Test Fan Registration & Login

1. **Register as Fan**
   - Go to http://localhost:3000/register
   - Fill in:
     - Email: `fan@test.com`
     - Username: `testfan` (optional)
     - Password: `password123`
     - Account Type: **Fan**
   - Click "Register"
   - Should redirect to `/feed` automatically

2. **Logout and Login**
   - Click "Logout" in navbar
   - Go to http://localhost:3000/login
   - Login with `fan@test.com` / `password123`
   - Should redirect to `/feed`

### 2. Test Creator Onboarding Flow

1. **Register as Creator**
   - Logout if logged in
   - Go to `/register`
   - Register with:
     - Email: `creator@test.com`
     - Password: `password123`
     - Account Type: **Creator**
   - Should redirect to `/creator` dashboard

2. **Apply as Creator**
   - You should see "Apply as Creator" button
   - Click it
   - Should show "Application submitted! Waiting for approval."
   - Status should show "pending"

3. **Admin Approves Creator**
   - Logout
   - Login as admin: `admin@fanhouse.com` / `admin123`
   - Go to `/admin`
   - Click "Creators" tab
   - Find `creator@test.com`
   - Click "Approve" button
   - Status should change to "approved"

4. **Creator Creates Content**
   - Logout
   - Login as `creator@test.com` / `password123`
   - Go to `/creator`
   - Click "Create Post"
   - Fill in:
     - Title: "My First Post"
     - Content: "This is my first post!"
     - Access Type: Try each:
       - **Public** - Free for all
       - **Subscriber Only** - Requires subscription
       - **PPV** - Pay per view (set price, e.g., $5.99)
   - Upload an image or video (optional)
   - Click "Create Post"
   - Post should appear in "Your Posts" section

### 3. Test Content Access & Gating

1. **View Public Content**
   - Login as fan: `fan@test.com`
   - Go to `/feed`
   - Should see all public posts
   - Should see subscriber-only posts but with access restrictions
   - Should see PPV posts but locked

2. **Subscribe to Creator**
   - Go to `/creators` page
   - Find the creator you want to subscribe to
   - Click "Subscribe ($9.99/month)"
   - Should show success message
   - Go back to `/feed`
   - Should now see subscriber-only content unlocked

3. **Unlock PPV Content**
   - In `/feed`, find a PPV post
   - Should show "PPV Content - Unlock to view"
   - Click "Unlock for $X.XX"
   - Should show success
   - Content should now be visible

### 4. Test Admin Panel

1. **View Users**
   - Login as admin
   - Go to `/admin`
   - Click "Users" tab
   - Should see all registered users

2. **View Creators**
   - Click "Creators" tab
   - Should see all creators with their status
   - Test approve/reject/disable actions

3. **View Transactions**
   - Click "Transactions" tab
   - Should see all ledger entries:
     - Subscriptions
     - PPV unlocks
   - Verify amounts and user information

4. **Disable Creator**
   - In Creators tab
   - Click "Disable" on a creator
   - Confirm action
   - Creator's posts should be disabled

### 5. Test Real-Time Features

1. **New Post Notifications**
   - Login as fan with active subscription
   - In another browser/incognito, login as creator
   - Creator creates a new post
   - Fan should see notification appear (top-right)
   - Notification should say "New post available!"

2. **PPV Unlock Notifications**
   - Fan unlocks a PPV post
   - Should see "PPV content unlocked!" notification

### 6. Test Edge Cases

1. **Unauthorized Access**
   - Try accessing `/admin` as non-admin → Should redirect
   - Try accessing `/creator` as fan → Should redirect
   - Try accessing `/feed` as creator → Should redirect to creator dashboard

2. **Content Access Control**
   - As fan, try to view subscriber-only content without subscription → Should be blocked
   - Try to view PPV without unlocking → Should show unlock button

3. **Creator Restrictions**
   - As pending creator, try to create post → Should show error
   - As rejected creator, try to create post → Should show error
   - Only approved creators can create posts

## Testing Checklist

- [ ] Fan registration works
- [ ] Fan login works
- [ ] Creator registration works
- [ ] Creator application submission works
- [ ] Admin can approve creators
- [ ] Admin can reject creators
- [ ] Approved creators can create posts
- [ ] Public posts are visible to all
- [ ] Subscriber-only posts require subscription
- [ ] PPV posts require unlock
- [ ] Subscription payment works (mocked)
- [ ] PPV unlock payment works (mocked)
- [ ] Admin panel shows users
- [ ] Admin panel shows creators
- [ ] Admin panel shows transactions
- [ ] Admin can disable creators
- [ ] Real-time notifications work
- [ ] Redirects work correctly after login/register
- [ ] Role-based access control works

## Common Issues & Solutions

**Issue**: Redirect not working after login
- **Solution**: Hard refresh (Cmd+Shift+R) or clear browser cache

**Issue**: Can't see posts
- **Solution**: Check if creator is approved, check access type

**Issue**: Can't subscribe
- **Solution**: Ensure creator is approved

**Issue**: Notifications not showing
- **Solution**: Ably key not required for basic functionality, but real-time features work better with it

## API Testing (Optional)

You can also test the API directly:

```bash
# Health check
curl http://localhost:3001/health

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"fan"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Next Steps

After testing, you should have verified:
- ✅ All authentication flows
- ✅ Creator onboarding process
- ✅ Content creation and gating
- ✅ Payment system (mocked)
- ✅ Admin functionality
- ✅ Real-time features
- ✅ Access control

