# EcoSpark Hub: Architecture

This document describes how EcoSpark Hub is built: the system layout, how data flows, the database design, security, and deployment. It complements `EcoSpark-Hub-PRD.md` (what to build) and `DESIGN_SYSTEM.md` (how it looks).

---

## 1. System Overview

EcoSpark Hub is a two-repo full-stack application.

- **Client** (`ecospark-client`): Next.js (App Router) + Tailwind CSS. Renders pages, handles forms, and calls the API.
- **Server** (`ecospark-server`): Node.js + Express REST API. Holds all business rules, authentication, authorization and payment verification.
- **Database:** PostgreSQL accessed through Prisma.
- **External services:** payment gateway (SSLCommerz, ShurjoPay or Stripe), image storage (Cloudinary or ImgBB).

```
                        ┌──────────────────────────┐
                        │        Browser           │
                        └────────────┬─────────────┘
                                     │ HTTPS
                        ┌────────────▼─────────────┐
                        │  Next.js Client (Vercel) │
                        │  SSR / RSC + Tailwind    │
                        └────────────┬─────────────┘
                                     │ REST (JSON) + JWT
                        ┌────────────▼─────────────┐
                        │ Express API (Render/     │
                        │ Railway/Vercel)          │
                        └───┬──────────┬────────┬──┘
                            │          │        │
                  ┌─────────▼──┐  ┌────▼─────┐ ┌▼───────────────┐
                  │ PostgreSQL │  │ Image    │ │ Payment gateway│
                  │ (Prisma)   │  │ storage  │ │ (sandbox/live) │
                  └────────────┘  └──────────┘ └────────────────┘
```

**Key principle:** the server is the single source of truth. The client only presents data and never decides who may see or change something.

---

## 2. Technology Choices

| Concern | Choice | Reason |
|---|---|---|
| Frontend framework | Next.js (App Router) | SSR and static generation, file-based routing, required by the assignment |
| Styling | Tailwind CSS | Consistent utility styling, required |
| Forms and validation | React Hook Form + Zod | Shared validation approach on client and server |
| API | Express.js + TypeScript | Simple REST API, required |
| ORM | Prisma | Type-safe queries and migrations |
| Database | PostgreSQL | Relational data with constraints (unique votes, foreign keys) |
| Auth | JWT + bcrypt | Stateless sessions, hashed passwords |
| Payments | SSLCommerz / ShurjoPay / Stripe | Paid idea access |
| Deployment | Vercel + Render/Railway | Free tiers, easy CI from GitHub |

---

## 3. Backend Architecture

### 3.1 Layered Structure

```
Request
  │
  ▼
Routes ──► Middlewares ──► Controller ──► Service ──► Prisma ──► PostgreSQL
            (auth, role,     (parse req,   (business    (queries)
             validate)        send res)     rules)
  │
  ▼
Global Error Handler ──► Standard JSON error response
```

| Layer | Responsibility | Must NOT |
|---|---|---|
| **Routes** | Map URL and method to middlewares and a controller | Contain logic |
| **Middlewares** | JWT verification, role check, Zod validation | Query the database for business logic |
| **Controller** | Read request, call service, send response with `sendResponse` | Call Prisma directly |
| **Service** | Business rules, ownership checks, Prisma queries | Touch `req` or `res` |
| **Utils** | `ApiError`, `catchAsync`, `sendResponse`, `jwt`, `hash`, `pagination` | Hold state |

### 3.2 Modules

Each module lives in `src/modules/<name>/` with `routes`, `controller`, `service`, `validation`.

| Module | Responsibility |
|---|---|
| `auth` | Register, login, current user, token issuing |
| `user` | Profile, admin member management (activate/deactivate, role change) |
| `category` | Admin-managed categories |
| `idea` | CRUD, draft and submit, approve/reject, search, filter, sort, pagination, paywall check |
| `vote` | Upsert and remove votes, counts |
| `comment` | Nested comments, delete |
| `payment` | Initiate, gateway callback, verification, purchase history |
| `newsletter` | Email subscription |
| `watchlist` | Optional favorites |
| `stats` | Admin dashboard numbers |

### 3.3 Standard Response Shape

```json
// success
{ "success": true, "message": "Ideas fetched", "data": [...], "meta": { "page": 1, "limit": 12, "total": 48, "totalPages": 4 } }

// error
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "Invalid email" }] }
```

HTTP codes: `200, 201, 400, 401, 403, 404, 409, 500`.

---

## 4. Frontend Architecture

### 4.1 Rendering Strategy

| Page | Rendering | Why |
|---|---|---|
| Home, All Ideas, Idea Details | Server Components (SSR) with client islands (vote, comments, filters) | SEO and fast first load |
| About, Blog, FAQ, Terms, Privacy | Static | Rarely change |
| Auth pages, Dashboards | Client-heavy | Forms and interactive tables |

### 4.2 Layers

```
app/ (routes, layouts, loading, error)
  └─ components/ (ui, layout, home, ideas, comments, dashboard, shared)
       └─ hooks/ + context/AuthContext
            └─ services/ (API functions)
                 └─ lib/api.ts (fetch wrapper: base URL, credentials, error handling)
```

- **Route protection:** `middleware.ts` redirects logged-out users to `/login` and blocks non-admins from `/dashboard/admin/*`. This is a UX guard only; the API enforces the real rules.
- **State:** server data comes from Server Components or service calls; small UI state uses React state; the logged-in user is held in `AuthContext`.
- **Filters:** stored in URL search params (`?search=&category=&sort=&page=`) so pages are shareable and SSR-friendly.
- **Errors and loading:** every route has `loading.tsx` (skeletons) and handles API errors with clear messages.

---

## 5. Database Design

### 5.1 Entity Relationship Overview

```
User ──< Idea >── Category
 │        │
 │        ├──< Vote >── User
 │        ├──< Comment (self-relation via parentId) >── User
 │        ├──< Payment >── User
 │        └──< Watchlist / Review (optional)
Newsletter (standalone)
```

### 5.2 Prisma Schema (core)

```prisma
enum Role        { ADMIN MEMBER }
enum IdeaStatus  { DRAFT UNDER_REVIEW APPROVED REJECTED }
enum VoteType    { UP DOWN }
enum PaymentStatus { PENDING PAID FAILED CANCELLED }

model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(MEMBER)
  isActive     Boolean  @default(true)
  image        String?
  createdAt    DateTime @default(now())

  ideas    Idea[]
  votes    Vote[]
  comments Comment[]
  payments Payment[]
}

model Category {
  id          String  @id @default(uuid())
  name        String  @unique
  description String?
  ideas       Idea[]
}

model Idea {
  id               String     @id @default(uuid())
  title            String
  problemStatement String
  proposedSolution String
  description      String
  images           String[]
  status           IdeaStatus @default(DRAFT)
  isPaid           Boolean    @default(false)
  price            Decimal?   @db.Decimal(10, 2)
  feedback         String?
  authorId         String
  categoryId       String
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  author   User      @relation(fields: [authorId], references: [id])
  category Category  @relation(fields: [categoryId], references: [id])
  votes    Vote[]
  comments Comment[]
  payments Payment[]

  @@index([status, createdAt])
  @@index([categoryId])
  @@index([authorId])
}

model Vote {
  id      String   @id @default(uuid())
  type    VoteType
  userId  String
  ideaId  String
  user    User     @relation(fields: [userId], references: [id])
  idea    Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)

  @@unique([userId, ideaId])
}

model Comment {
  id        String   @id @default(uuid())
  content   String
  userId    String
  ideaId    String
  parentId  String?
  createdAt DateTime @default(now())

  user    User      @relation(fields: [userId], references: [id])
  idea    Idea      @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  parent  Comment?  @relation("Replies", fields: [parentId], references: [id], onDelete: Cascade)
  replies Comment[] @relation("Replies")

  @@index([ideaId])
}

model Payment {
  id            String        @id @default(uuid())
  amount        Decimal       @db.Decimal(10, 2)
  status        PaymentStatus @default(PENDING)
  transactionId String        @unique
  userId        String
  ideaId        String
  createdAt     DateTime      @default(now())

  user User @relation(fields: [userId], references: [id])
  idea Idea @relation(fields: [ideaId], references: [id])

  @@index([userId, ideaId, status])
}

model Newsletter {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

**Access to a paid idea** is derived from a `Payment` with `status = PAID` for that `(userId, ideaId)`, so no separate table is needed.

### 5.3 Integrity Rules Enforced by the Database
- One vote per user per idea: `@@unique([userId, ideaId])`.
- Unique email, unique category name, unique payment `transactionId` (makes callbacks idempotent).
- Deleting an idea cascades to its votes and comments.

---

## 6. Authentication and Authorization

### 6.1 Auth Flow

```
Register/Login ─► server verifies (bcrypt) ─► issues JWT { id, role }
      │
      ▼
JWT stored in httpOnly cookie (or sent as Bearer token)
      │
      ▼
Each request ─► auth middleware verifies JWT ─► loads user ─► rejects if inactive
      │
      ▼
role middleware ─► ADMIN-only routes
      │
      ▼
Service checks ownership (e.g. member edits only own idea)
```

### 6.2 Permission Matrix

| Action | Visitor | Member | Admin |
|---|:-:|:-:|:-:|
| View free approved ideas | ✅ | ✅ | ✅ |
| View paid idea full content | ❌ | ✅ after payment (or author) | ✅ |
| Create / submit idea | ❌ | ✅ | ✅ |
| Edit / delete own idea | ❌ | ✅ only Draft or Rejected | ✅ any |
| Approve / reject idea | ❌ | ❌ | ✅ |
| See rejection feedback | ❌ | ✅ own ideas only | ✅ |
| Vote / comment | ❌ | ✅ | ✅ |
| Delete comment | ❌ | ✅ own | ✅ any |
| Manage members and categories | ❌ | ❌ | ✅ |

### 6.3 Security Measures
- Passwords hashed with bcrypt; `passwordHash` is never returned or logged.
- JWT secret and gateway keys come from environment variables only.
- All inputs validated with Zod on the server; Prisma parameterizes queries (protects against SQL injection).
- CORS restricted to the client URL; httpOnly cookies reduce XSS token theft.
- Deactivated users are blocked at the auth middleware.
- Rate limiting on auth routes (recommended).

---

## 7. Key Flows

### 7.1 Idea Lifecycle

```
Member creates ─► DRAFT ─submit─► UNDER_REVIEW ─┬─approve─► APPROVED (public)
                    ▲                            └─reject + feedback─► REJECTED
                    └──────── edit & resubmit ◄──────────────────────────┘
```

Server enforces: edit or delete only in `DRAFT` or `REJECTED`; approve or reject only from `UNDER_REVIEW` (otherwise `409`); reject requires feedback.

### 7.2 Voting

```
PUT /ideas/:id/vote {type}  ─► upsert on (userId, ideaId)  ─► return new counts
DELETE /ideas/:id/vote      ─► delete row                  ─► return new counts
```

### 7.3 Paid Idea Payment

```
1. User clicks Buy (logged in)
2. POST /payments/initiate
      server checks: idea is paid + approved, not author, not already bought
      creates Payment(PENDING, transactionId) ─► returns gateway URL
3. Browser redirects to gateway and the user pays
4. Gateway ─► POST /payments/callback (server-to-server)
      server VERIFIES with the gateway API
      idempotent update: PENDING ─► PAID or FAILED
5. Gateway redirects the browser to /payment/success | failed | cancelled
6. GET /ideas/:id now returns full content (a PAID payment exists)
```

The client redirect alone never grants access; only the verified server callback does.

### 7.4 Idea Listing Query

```
GET /ideas?search=&category=&isPaid=&minVotes=&author=&sort=recent|top|commented&page=&limit=12
   ─► validate params ─► build Prisma where + orderBy (status = APPROVED only)
   ─► return data + meta { page, limit, total, totalPages }
```

For paid ideas, the list returns only card fields (title, summary, image, price, badge); the details endpoint decides whether to include full content.

---

## 8. Error Handling Strategy

| Layer | Approach |
|---|---|
| Server validation | Zod middleware returns `400` with field errors |
| Auth errors | `401` invalid or missing token, `403` wrong role or not owner |
| Not found / conflict | `404`, `409` (e.g. duplicate email, invalid status transition) |
| Unexpected errors | Global handler returns `500` with a safe message (no stack traces in production) |
| Client | Field-level form errors, toasts for API failures, `error.tsx` boundaries, dedicated 404 and Unauthorized pages |
| Loading | `loading.tsx` skeletons, button spinners, payment processing indicator |

---

## 9. Configuration and Environments

| Environment | Client | Server | Database |
|---|---|---|---|
| Local | `localhost:3000` | `localhost:5000` | Local Postgres |
| Production | Vercel | Render / Railway / Vercel | Hosted Postgres (Neon, Supabase, Railway) |

Environment variables are listed in each repo's `.env.example`; real `.env` files are never committed.

---

## 10. Deployment and Delivery

```
GitHub (client repo) ──push──► Vercel ─► https://<client>.vercel.app
GitHub (server repo) ──push──► Render/Railway/Vercel ─► https://<server>...
                                   │
                                   └─ prisma migrate deploy + seed (admin, categories)
```

Deployment steps: set env vars, run migrations and seed, deploy the server, verify a health route, set `NEXT_PUBLIC_API_URL`, deploy the client, then test login, an idea flow and a sandbox payment on the live URLs.

---

## 11. Non-Functional Considerations

- **Performance:** server-side pagination, DB indexes on `status`, `categoryId`, `authorId`, `createdAt`; optimized images via `next/image`.
- **Scalability:** the API is stateless (JWT), so it can run several instances behind a load balancer; the database is the shared state.
- **Maintainability:** feature-based modules, small functions, typed end to end, consistent commit history (`feat:`, `fix:`, `style:`).
- **Observability:** request logging (morgan), a `/health` route, meaningful error messages.

---

## 12. Decisions and Trade-offs

| Decision | Trade-off |
|---|---|
| Two separate repos | Matches the submission requirement, but shared types are duplicated |
| Derive paid access from `Payment` | Fewer tables; needs an index on `(userId, ideaId, status)` |
| JWT (stateless) | Simple and scalable; logout and instant revocation need extra work (short expiry, and the `isActive` check on each request) |
| Computed vote counts by aggregation | Always correct; if it gets slow, add cached counters on `Idea` |
| Payments go to the platform in v1 | Simpler; author payouts are a future enhancement |

---

## 13. Future Improvements

Author payouts, email notifications, real-time comments (WebSockets), full-text search (Postgres `tsvector`), caching hot queries (Redis), analytics dashboard, and automated tests plus CI.