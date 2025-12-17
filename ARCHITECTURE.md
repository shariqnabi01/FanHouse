# Architecture Decisions

This document outlines key architectural decisions made in building this vertical slice.

## Database Design

### Ledger System
The ledger table is **append-only**. This is critical for:
- Audit trails
- Payout calculations
- Financial compliance
- No data loss or manipulation

All financial transactions are recorded here, never updated. Balances are calculated by summing ledger entries, not stored directly.

### Access Control
Content access is enforced at the **API level**, not just UI:
- Subscriber-only posts require active subscription check
- PPV posts require unlock record check
- Public posts are accessible to all authenticated users

## Real-Time Architecture

### Ably Integration
- Channels are topic-based (posts, unlocks, subscriptions, admin)
- Events are published on state changes
- Frontend subscribes to relevant channels
- Gracefully degrades when Ably key not configured

### Notification Flow
1. Backend action occurs (e.g., new post)
2. Ably event published
3. Frontend receives event
4. UI updates in real-time

## Authentication

### JWT Tokens
- Stateless authentication
- 7-day expiration
- Stored in localStorage (client-side)
- Verified on every API request

### Role-Based Access
- Three roles: fan, creator, admin
- Middleware enforces role requirements
- Creator status separate from user role

## File Uploads

### Current Implementation
- Local file storage in `backend/uploads`
- Multer handles multipart/form-data
- 50MB file size limit
- Supports images and videos

### Production Consideration
Easy to swap to cloud storage (S3/GCS) by changing multer storage configuration.

## Mocked Integrations

### Persona (Identity Verification)
- Mocked but maintains proper state flow
- States: pending → approved/rejected
- Inquiry IDs generated
- Webhook structure ready for real integration

### Knock.app (Notifications)
- Mocked but uses Ably for real-time delivery
- In-app notifications work
- Email notifications not implemented (SFW requirement)

### CCBill (Payments)
- Fully mocked transaction processing
- Transaction IDs generated
- All transactions recorded in ledger
- Ready for real API integration

## API Design

### RESTful Structure
- `/api/auth` - Authentication
- `/api/creator` - Creator operations
- `/api/content` - Content management
- `/api/payment` - Payment operations
- `/api/admin` - Admin operations

### Error Handling
- Consistent error response format
- HTTP status codes used appropriately
- Error messages are user-friendly

## Frontend Architecture

### Next.js App Router
- Server and client components separated
- Client components for interactivity
- Route-based organization

### State Management
- React Context for auth state
- Local state for component data
- API calls via axios with interceptors

### Component Structure
- shadcn/ui for base components
- Custom components for business logic
- Reusable UI patterns

## Security Considerations

### Current Implementation
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- SQL injection prevention (parameterized queries)

### Production Needs
- Rate limiting (infrastructure ready)
- CORS configuration
- Environment variable management
- HTTPS enforcement
- Input validation (Zod ready)

## Scalability Considerations

### Database
- Indexes on frequently queried columns
- Foreign key constraints
- UUID primary keys

### API
- Stateless design (JWT)
- Prepared for horizontal scaling
- Redis ready for caching

### File Storage
- Local storage (dev)
- Cloud storage ready (prod)

## Tradeoffs

### What We Prioritized
1. **Architectural correctness** - Proper patterns and structure
2. **Complete functionality** - All requirements implemented
3. **Deployment readiness** - Docker setup complete
4. **Real-world patterns** - Ledger, access control, etc.

### What We Simplified
1. **UI Polish** - Functional but not pixel-perfect
2. **Email Notifications** - Not implemented (SFW requirement)
3. **Cloud Storage** - Local for simplicity
4. **Testing** - Manual testing focus

## Deployment Strategy

### Docker Compose (Development)
- All services containerized
- Easy local development
- Production-like environment

### Cloud Run (Production Ready)
- Backend designed for Cloud Run
- Stateless API design
- Environment-based configuration

## Future Enhancements

1. **Real Integrations**
   - Replace mocked Persona, Knock, CCBill
   - Add cloud storage (S3/GCS)
   - Email notifications

2. **Performance**
   - Redis caching
   - CDN for media
   - Database query optimization

3. **Features**
   - Search functionality
   - Advanced filtering
   - Analytics dashboard
   - Messaging system

