# FanHouse - Creator Platform (Vertical Slice)

A production-ready vertical slice of an OnlyFans-class creator platform demonstrating authentication, creator onboarding, content gating, payments, real-time features, and admin controls.

## Video Walkthrough



[Watch the Loom video walkthrough here](https://www.loom.com/share/a64bb4978efa49188497ca1bec8866b0)

This video should cover:
- Architecture overview
- Data model and ledger system
- API-level access control implementation
- Mocked integrations with proper state flows
- Real-time features and deployment

**To add your video:**
1. Record a 3-5 minute Loom video walkthrough
2. Copy the share URL from Loom (format: `https://www.loom.com/share/VIDEO_ID`)
3. Replace `YOUR_VIDEO_ID_HERE` in the link above with your actual video ID

## Architecture Overview

This project is built as a full-stack application with:

- **Frontend**: Next.js 14 (App Router) with TypeScript, TailwindCSS, and shadcn/ui
- **Backend**: Node.js/Express API with TypeScript
- **Database**: PostgreSQL with proper schema and indexes
- **Real-time**: Ably integration for live updates
- **Infrastructure**: Docker Compose for local development

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui components
- Ably for real-time features

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL
- JWT authentication
- Multer for file uploads
- Ably integration

### Integrations
- **Persona**: Creator verification flow (mocked, but states and flow exist)
- **Knock.app**: In-app notifications (mocked, uses Ably for real-time)
- **Payments**: 
  - **Stripe** (optional - if API key provided, uses real test payments)
  - **CCBill Mock** (fallback if Stripe not configured)
  - Ledger records all transactions (real, append-only)

## Features Implemented

### 1. Authentication & Roles
- User registration and login
- JWT-based authentication
- Role-based access control (Fan, Creator, Admin)
- Protected routes and API endpoints

### 2. Creator Onboarding
- Creator application flow
- Persona integration (mocked) for verification
- Status states: pending, approved, rejected
- Only approved creators can monetize

### 3. Content & Gating
- Creators can create posts with text and media
- Three access types:
  - **Public**: Free for all
  - **Subscriber-only**: Requires active subscription
  - **PPV (Pay Per View)**: One-time unlock payment
- Access enforcement at API level
- Media upload support (images and videos)

### 4. Real-Time Features
- Ably integration for real-time events:
  - New post notifications
  - PPV unlock confirmations
  - Admin action updates
  - Creator application notifications

### 5. Admin Panel
- View all users and creators
- Approve/reject creator applications
- View transaction ledger
- Disable creators or posts
- Accessible at `/admin`

### 6. Payment System (Mocked)
- Subscription payments (mock CCBill)
- PPV unlock payments
- Append-only ledger system
- Complete transaction history
- No direct balance updates (ledger-only approach)

## Project Structure

```
FanHouse/
├── backend/
│   ├── src/
│   │   ├── db/           # Database connection and schema
│   │   ├── middleware/   # Auth middleware
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utilities (Ably, Persona, CCBill, etc.)
│   │   └── index.ts      # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml    # Docker orchestration
└── README.md
```

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development without Docker)
- PostgreSQL 15+ (if running database separately)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FanHouse
   ```

2. **Set up environment variables**
   
   Create `.env` files (optional for local development):
   - `backend/.env` (see `backend/.env.example`)
   - `frontend/.env.local` (see `frontend/.env.example`)

   For Ably integration, add your API key:
   ```env
   # backend/.env
   ABLY_API_KEY=your-ably-key
   
   # frontend/.env.local
   NEXT_PUBLIC_ABLY_KEY=your-ably-key
   ```

3. **Start all services**
   ```bash
   docker-compose up
   ```

   This will start:
   - PostgreSQL on port 5432
   - Redis on port 6379
   - Backend API on port 3001
   - Frontend on port 3000

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

### Local Development (Without Docker)

1. **Start PostgreSQL**
   ```bash
   # Using Docker
   docker run -d --name fanhouse-postgres \
     -e POSTGRES_USER=fanhouse \
     -e POSTGRES_PASSWORD=fanhouse_dev \
     -e POSTGRES_DB=fanhouse \
     -p 5432:5432 \
     postgres:15-alpine
   ```

2. **Install dependencies**
   ```bash
   # Root
   npm install
   
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env.local
   ```

4. **Initialize database**
   The database schema is automatically created on backend startup.

5. **Start services**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Creating an Admin User

To create an admin user, you can either:

1. **Register via API**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@fanhouse.com",
       "password": "admin123",
       "role": "admin"
     }'
   ```

2. **Direct database insert** (after registering as regular user):
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Creator
- `POST /api/creator/apply` - Apply to become creator
- `GET /api/creator/:id` - Get creator profile
- `GET /api/creator/me/profile` - Get my creator profile

### Content
- `POST /api/content` - Create post (creator only)
- `GET /api/content` - Get posts (with access control)
- `GET /api/content/:id` - Get single post

### Payment
- `POST /api/payment/subscribe` - Subscribe to creator
- `POST /api/payment/unlock-ppv` - Unlock PPV post
- `GET /api/payment/subscriptions` - Get my subscriptions

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/creators` - Get all creators
- `POST /api/admin/creators/:id/approve` - Approve creator
- `POST /api/admin/creators/:id/reject` - Reject creator
- `POST /api/admin/creators/:id/disable` - Disable creator
- `GET /api/admin/transactions` - Get transaction ledger

## Database Schema

### Core Tables
- `users` - User accounts with roles
- `creators` - Creator profiles with verification status
- `posts` - Content posts with access types
- `subscriptions` - Fan subscriptions to creators
- `ppv_unlocks` - PPV unlock records
- `ledger` - Append-only transaction ledger

All tables include proper indexes for performance.

## Real-Time Events

Ably channels used:
- `posts` - New post notifications
- `unlocks` - PPV unlock confirmations
- `subscriptions` - New subscription events
- `admin` - Admin action notifications

## Tradeoffs and Decisions

### What We Built Well
1. **Ledger System**: Append-only transaction recording mirrors real payout logic
2. **Access Control**: Enforced at API level, not just UI
3. **Real-time Integration**: Ably properly integrated for live updates
4. **Docker Setup**: Complete containerization for easy deployment

### Shortcuts Taken
1. **Mocked Integrations**: Persona, Knock, and CCBill are mocked but maintain proper state flows
2. **File Storage**: Local file storage instead of cloud (S3/GCS) - easy to swap
3. **No Email**: Email notifications not implemented (SFW requirement)
4. **Basic UI**: Functional but not pixel-perfect (as requested)

### Scalability Considerations
- Database indexes on frequently queried columns
- JWT tokens for stateless auth
- File upload size limits (50MB)
- Prepared for Redis caching (infrastructure ready)
- Ledger design supports audit trails and payout calculations

## Testing the Application

1. **Register as Fan**
   - Go to http://localhost:3000/register
   - Create a fan account

2. **Apply as Creator**
   - Login as fan
   - Navigate to creator dashboard
   - Apply to become creator

3. **Approve Creator (Admin)**
   - Login as admin
   - Go to /admin
   - Approve the creator application

4. **Create Content**
   - Login as approved creator
   - Create posts with different access types

5. **Subscribe and Unlock**
   - Login as fan
   - Subscribe to creator
   - Unlock PPV content

## Deployment Notes

### Production Considerations
- Replace mocked integrations with real APIs
- Use cloud storage (S3/GCS) for media files
- Set up proper JWT secret management
- Configure CORS properly
- Add rate limiting
- Set up database backups
- Use environment-specific configs

### Cloud Run Deployment
The backend is designed to run on Cloud Run. Update `docker-compose.yml` or use Cloud Run's container deployment.

## License

This is a test project for evaluation purposes.

## Contact

For questions about this implementation, please refer to the codebase comments and architecture decisions documented above.

