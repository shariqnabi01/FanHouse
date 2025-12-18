# Loom Video Script - FanHouse Vertical Slice

**Duration:** 3-5 minutes  
**Purpose:** Walk through architecture, data model, decisions, and tradeoffs

---

## Introduction (30 seconds)

"Hi, I'm [Your Name]. This is a walkthrough of the FanHouse vertical slice I built. I'll cover the architecture, data model, a key decision I made, and a shortcut I took."

---

## 1. Architecture Overview (1 minute)

### High-Level Architecture
"Let me start with the overall architecture:

**Frontend:**
- Next.js 14 with App Router
- TypeScript for type safety
- TailwindCSS and shadcn/ui for modern UI
- Client-side authentication with JWT tokens

**Backend:**
- Node.js/Express API in TypeScript
- PostgreSQL for persistent data
- Redis for caching (optional)
- Docker containerization

**Key Services:**
- Ably for real-time features
- Stripe for payments (with mock fallback)
- Persona for identity verification (mocked)
- Knock for notifications (mocked, uses Ably)

**Deployment:**
- All services containerized with Docker
- Deployed on Render with automatic Blueprint sync
- Environment-based configuration"

### Show:
- Open `ARCHITECTURE.md`
- Point to the stack diagram
- Show `docker-compose.yml` briefly

---

## 2. Data Model (1 minute)

### Database Schema
"Now let's look at the data model. I designed this with scalability and auditability in mind:

**Core Tables:**
- `users` - Authentication and roles (fan, creator, admin)
- `creators` - Creator profiles with verification status
- `posts` - Content with access types (public, subscriber, PPV)
- `subscriptions` - Fan-to-creator relationships
- `ppv_unlocks` - One-time content unlocks
- `ledger` - **Critical: Append-only transaction log**

### The Ledger System
"This is the most important architectural decision. The ledger is **append-only** - we never update or delete entries. This ensures:
- Complete audit trail
- Financial compliance
- Accurate payout calculations
- No data loss or manipulation

Balances are calculated by summing ledger entries, never stored directly."

### Show:
- Open `backend/src/db/schema.ts`
- Highlight the ledger table structure
- Show how transactions are recorded in `backend/src/utils/ledger.ts`
- Point to `ARCHITECTURE.md` ledger section

---

## 3. Smart Decision: API-Level Access Control (1 minute)

### The Decision
"One smart decision I made was enforcing content access at the **API level**, not just the UI.

**Why this matters:**
- Security: Users can't bypass UI restrictions
- Consistency: Same rules apply everywhere
- Scalability: Works with mobile apps, webhooks, etc.
- Auditability: All access attempts are logged

**Implementation:**
In the content routes, I check subscriptions and unlocks before returning media URLs. Even if someone tries to access content directly, the API enforces the rules."

### Show:
- Open `backend/src/routes/content.ts`
- Point to lines 110-128 (subscriber access check)
- Point to lines 119-127 (PPV access check)
- Show how locked content returns metadata but no media

**Key Code:**
```typescript
// Check subscription before returning content
const subResult = await pool.query(
  'SELECT id FROM subscriptions WHERE fan_id = $1 AND creator_id = $2 AND status = $3',
  [req.userId, post.creator_id, 'active']
);
if (subResult.rows.length === 0) {
  // Return post but hide media
  return { ...post, media_url: null, _locked: true };
}
```

---

## 4. Shortcut: Mocked Integrations with Proper State Flow (1 minute)

### The Shortcut
"I knowingly took a shortcut with Persona, Knock, and initially CCBill - I mocked them. But I did it **architecturally correctly**.

**What I did:**
- Created proper interfaces and state flows
- Maintained the same data structures as real APIs
- Made it easy to swap in real implementations
- All state transitions work correctly

**Example - Persona:**
Even though it's mocked, the verification flow has proper states: pending → approved/rejected. The database stores inquiry IDs, and the webhook structure is ready for real integration."

### Show:
- Open `backend/src/utils/persona.ts`
- Show how it generates inquiry IDs and maintains state
- Open `backend/src/utils/knock.ts`
- Show how it uses Ably for real-time delivery even when mocked
- Point to `ARCHITECTURE.md` mocked integrations section

**Why this shortcut:**
- Saves time on third-party integrations
- Maintains architectural integrity
- Easy to replace with real APIs later
- All business logic works correctly

---

## 5. Real-Time Features (30 seconds)

### Ably Integration
"I implemented real-time features using Ably with graceful degradation:
- New post notifications
- PPV unlock confirmations
- Admin action updates
- If Ably isn't configured, it falls back to mock mode

The frontend subscribes to channels and updates the UI in real-time."

### Show:
- Open `frontend/components/realtime-notifications.tsx`
- Show how it subscribes to channels
- Open `backend/src/utils/ably.ts` - show graceful fallback

---

## 6. Payment Integration (30 seconds)

### Stripe Integration
"I went beyond the requirement and integrated real Stripe payments:
- Stripe Checkout Sessions for secure payment flow
- Automatic redirect to Stripe's payment page
- Payment confirmation via webhook-ready endpoint
- Falls back to mock if Stripe not configured

This gives a production-ready payment experience while maintaining the mock fallback for testing."

### Show:
- Open `backend/src/utils/stripe.ts`
- Show Checkout Session creation
- Point to the payment flow in `backend/src/routes/payment.ts`

---

## 7. Deployment (30 seconds)

### Production Deployment
"The entire stack is containerized and deployed on Render:
- Docker Compose for local development
- Render Blueprint for automatic deployment
- Environment-based configuration
- Health checks and monitoring

The app is live and ready for testing."

### Show:
- Open `render.yaml`
- Show the Blueprint configuration
- Mention the deployed URL

---

## Conclusion (30 seconds)

### Key Takeaways
"To summarize:
1. **Architecture**: Clean separation, scalable design
2. **Data Model**: Ledger-first approach for financial integrity
3. **Smart Decision**: API-level access control for security
4. **Shortcut**: Mocked integrations with proper state flows

The codebase is production-ready, well-documented, and follows best practices. All requirements are implemented, and I've added bonus features like real Stripe integration and a modern UI.

Thanks for watching!"

---

## Visual Checklist

Make sure to show:
- [ ] Architecture diagram or `ARCHITECTURE.md`
- [ ] Database schema (`backend/src/db/schema.ts`)
- [ ] Ledger implementation (`backend/src/utils/ledger.ts`)
- [ ] API-level access control (`backend/src/routes/content.ts`)
- [ ] Mocked integrations (`backend/src/utils/persona.ts`, `knock.ts`)
- [ ] Real-time features (`frontend/components/realtime-notifications.tsx`)
- [ ] Stripe integration (`backend/src/utils/stripe.ts`)
- [ ] Deployment config (`render.yaml`)
- [ ] Live application (if possible)

---

## Tips for Recording

1. **Screen Setup:**
   - Split screen: Code on left, browser/app on right
   - Or switch between code and live app

2. **Pacing:**
   - Don't rush through code
   - Pause to explain key concepts
   - Use cursor to highlight important lines

3. **Code Navigation:**
   - Use file explorer to show structure
   - Jump to key functions
   - Show related files together

4. **Live Demo:**
   - If possible, show the deployed app
   - Demonstrate a subscription flow
   - Show admin panel in action

5. **Keep it Concise:**
   - Focus on architecture and decisions
   - Don't read every line of code
   - Explain the "why" not just the "what"

---

## Alternative Shorter Version (3 minutes)

If you need to keep it to 3 minutes:

1. **Architecture** (45s) - High-level overview
2. **Data Model & Ledger** (45s) - Focus on append-only ledger
3. **Smart Decision** (45s) - API-level access control
4. **Shortcut** (45s) - Mocked integrations with proper flows

Skip the detailed code walkthroughs and focus on concepts.

