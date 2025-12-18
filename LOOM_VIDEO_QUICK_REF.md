# Loom Video Quick Reference

## 🎯 Key Points to Cover (3-5 minutes)

### 1. Architecture (1 min)
**Show:**
- `ARCHITECTURE.md` - Overall design
- `docker-compose.yml` - Service structure
- Tech stack overview

**Say:**
- "Full-stack with Next.js frontend, Express backend, PostgreSQL database"
- "Docker containerization for easy deployment"
- "Real-time features via Ably, payments via Stripe"

---

### 2. Data Model & Ledger (1 min)
**Show:**
- `backend/src/db/schema.ts` - Database schema
- `backend/src/utils/ledger.ts` - Ledger implementation
- Point to ledger table structure

**Say:**
- "Append-only ledger - critical for financial integrity"
- "No balance updates, only ledger entries"
- "Complete audit trail for compliance"

**Key Code to Highlight:**
```typescript
// backend/src/utils/ledger.ts - addLedgerEntry function
// Show it's INSERT only, no UPDATE
```

---

### 3. Smart Decision: API-Level Access Control (1 min)
**Show:**
- `backend/src/routes/content.ts` - Lines 110-128
- Show subscription check before returning content
- Show PPV unlock check

**Say:**
- "Access control at API level, not just UI"
- "Security: Can't bypass restrictions"
- "Works for web, mobile, any client"

**Key Code:**
```typescript
// Check subscription before returning media
if (subResult.rows.length === 0) {
  // Return post but hide media_url
  return { ...post, media_url: null, _locked: true };
}
```

---

### 4. Shortcut: Mocked Integrations (1 min)
**Show:**
- `backend/src/utils/persona.ts` - Mocked but proper states
- `backend/src/utils/knock.ts` - Mocked but uses Ably
- `backend/src/utils/ccbill.ts` - Mocked payments

**Say:**
- "Mocked Persona, Knock, CCBill to save time"
- "But maintained proper state flows"
- "Easy to swap in real APIs later"
- "All business logic works correctly"

**Key Point:**
- Show inquiry IDs are generated
- Show state transitions work (pending → approved)
- Show webhook structure is ready

---

## 📋 Talking Points

### Architecture Highlights
- ✅ Clean separation of concerns
- ✅ Scalable database design
- ✅ Real-time ready
- ✅ Production deployment ready

### Data Model Highlights
- ✅ Ledger-first approach
- ✅ Proper indexes for performance
- ✅ Foreign key constraints
- ✅ UUID primary keys

### Security Highlights
- ✅ API-level access control
- ✅ JWT authentication
- ✅ Role-based access
- ✅ SQL injection prevention

### Tradeoffs
- ✅ Prioritized: Architecture, functionality, deployment
- ⚠️ Simplified: UI polish, email notifications, cloud storage

---

## 🎬 Recording Tips

### Screen Setup Options:
1. **Split View:**
   - Left: Code editor
   - Right: Browser with app

2. **Switch View:**
   - Show code → Switch to app → Back to code

3. **Picture-in-Picture:**
   - Code full screen
   - Small window with app

### Key Files to Show:
1. `ARCHITECTURE.md` - Overview
2. `backend/src/db/schema.ts` - Data model
3. `backend/src/utils/ledger.ts` - Ledger system
4. `backend/src/routes/content.ts` - Access control
5. `backend/src/utils/persona.ts` - Mocked integration
6. `render.yaml` - Deployment config
7. Live app (if possible)

### Code Highlights:
- Use cursor to point at specific lines
- Zoom in on important functions
- Show related files together
- Explain the "why" not just "what"

---

## ⏱️ Timing Breakdown

**3-Minute Version:**
- Intro: 15s
- Architecture: 45s
- Data Model: 45s
- Smart Decision: 45s
- Shortcut: 30s

**5-Minute Version:**
- Intro: 30s
- Architecture: 1m
- Data Model: 1m
- Smart Decision: 1m
- Shortcut: 1m
- Real-time: 30s
- Payments: 30s
- Deployment: 30s
- Conclusion: 30s

---

## 💡 One-Liners for Each Section

**Architecture:**
"Clean, scalable full-stack architecture with proper separation of concerns."

**Data Model:**
"Ledger-first design ensures financial integrity and complete audit trails."

**Smart Decision:**
"API-level access control prevents security bypasses and works across all clients."

**Shortcut:**
"Mocked integrations save time while maintaining architectural correctness."

---

## 🎤 Script Template

**Opening:**
"Hi, I'm [Name]. This is a walkthrough of the FanHouse vertical slice. I'll cover the architecture, data model, a key decision, and a shortcut I took."

**Architecture:**
"Let me start with the overall architecture. We have a Next.js frontend, Express backend, PostgreSQL database, and Docker containerization. Real-time features use Ably, and payments use Stripe with a mock fallback."

**Data Model:**
"The most important part is the ledger system. It's append-only - we never update or delete entries. This ensures complete audit trails and financial compliance."

**Smart Decision:**
"One smart decision was enforcing access control at the API level. This means even if someone tries to bypass the UI, the API enforces the rules."

**Shortcut:**
"I mocked Persona, Knock, and CCBill to save time, but I maintained proper state flows and made it easy to swap in real APIs later."

**Closing:**
"The codebase is production-ready, well-documented, and follows best practices. All requirements are implemented. Thanks for watching!"

