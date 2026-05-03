# The Benjie Standard
### Engineering Principles, Design Systems & Workflow Rules
*A personal engineering bible — every project I ship lives by these rules.*

---

## 0. Philosophy

Every project I build should feel like it came from the same mind, even if the tech stack, UI, and industry are completely different. The fingerprint isn't visual — it's structural. It's in how APIs are named, how errors are shaped, how folders are organized, how data flows. A teammate or client should be able to pick up any of my projects and feel immediately oriented.

**Three things that never change across any project:**
1. **Predictability** — naming, structure, and behavior should be obvious before you look
2. **Defensive design** — every layer assumes the layer above it will lie
3. **Honest APIs** — responses always say what actually happened, never lie to be polite

---

## 1. Project Initialization Checklist

Before writing a single line of application code, every new project must have:

```
[ ] README.md — setup, env vars, how to run, how to test
[ ] .env.example — every environment variable documented with a description comment
[ ] .gitignore — correct for the stack (never commit .env, node_modules, dist, build)
[ ] Folder structure decided and committed as empty dirs with .gitkeep
[ ] Git initialized with a meaningful first commit: "init: project scaffold"
[ ] Linting configured (ESLint + Prettier for JS/TS, golangci-lint for Go, etc.)
[ ] A health check endpoint: GET /health → { status: "ok", timestamp, version }
```

**Commit message format (always):**
```
type: short description

types: init | feat | fix | refactor | style | test | docs | chore
```

Examples:
- `feat: add client discharge endpoint`
- `fix: handle null sponsor on payment creation`
- `refactor: extract billing engine to separate module`
- `chore: update dependencies`

---

## 2. Folder Structure — The Benjie Layout

The structure varies by stack but the *logic* is always the same.

### MERN / Node.js
```
project/
├── server/
│   ├── index.js                  # Entry point only — no logic here
│   ├── app.js                    # Express app setup, middleware
│   ├── controllers/              # Request handlers — thin, delegate to services
│   ├── services/                 # Business logic — this is where the real work happens
│   ├── models/                   # Data schemas / DB models
│   ├── routes/                   # Route definitions only — no logic
│   ├── middleware/               # Auth, error handling, validation
│   ├── utils/                    # Pure utility functions — no side effects
│   └── config/                   # DB connection, env parsing, constants
├── client/
│   └── src/
│       ├── pages/                # Route-level components
│       ├── components/
│       │   └── ui/               # Reusable, dumb UI components
│       ├── hooks/                # Custom React hooks
│       ├── context/              # Global state (auth, theme, etc.)
│       ├── utils/                # Formatters, helpers, constants
│       └── api/                  # All API calls — never fetch() raw in components
└── .env.example
```

### Golang
```
project/
├── cmd/
│   └── server/
│       └── main.go               # Entry point only
├── internal/
│   ├── handlers/                 # HTTP handlers — thin, delegate to services
│   ├── services/                 # Business logic
│   ├── repository/               # DB queries — all DB access lives here
│   ├── models/                   # Structs and domain types
│   ├── middleware/               # Auth, logging, error handling
│   └── config/                   # Config loading, env parsing
├── pkg/                          # Packages safe to import externally
├── migrations/                   # DB migration files
└── .env.example
```

### The Rule That Never Changes
> **Controllers/Handlers are dumb. Services are smart. Repositories talk to the database.**
>
> A controller should never contain a database query.
> A repository should never contain business logic.
> A service should never import from a controller.

---

## 3. API Design Rules

### 3.1 URL Structure

```
/api/v1/resource              GET    → list
/api/v1/resource              POST   → create
/api/v1/resource/:id          GET    → single item
/api/v1/resource/:id          PUT    → full update
/api/v1/resource/:id          PATCH  → partial update
/api/v1/resource/:id          DELETE → delete
/api/v1/resource/:id/action   PUT    → state change (e.g. /discharge, /archive)
```

**Rules:**
- Always plural nouns: `/clients` not `/client`
- Always lowercase with hyphens: `/care-facilities` not `/CareFacilities`
- Never verbs in the URL: `/clients/:id/discharge` not `/dischargeClient/:id`
- Always version the API: `/api/v1/` from day one
- Nested resources max 2 levels deep: `/clients/:id/payments` is fine, deeper is not
- Filter via query params: `/clients?status=active&search=john`

### 3.2 The Standard Response Envelope

**Every single API response — success or failure — uses this exact shape:**

```json
{
  "success": true,
  "message": "Clients retrieved successfully",
  "data": { },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "totalPages": 8
  }
}
```

```json
{
  "success": false,
  "message": "Client not found",
  "error": {
    "code": "CLIENT_NOT_FOUND",
    "details": "No client exists with ID: 64f1a2b3c4d5e6f7a8b9c0d1"
  },
  "data": null
}
```

**Rules:**
- `success` is always a boolean — never omit it
- `message` is always a human-readable string — never a raw error object
- `data` is always present — null on failure, never omit the key
- `meta` only on paginated list responses
- `error.code` is always a SCREAMING_SNAKE_CASE constant string
- HTTP status codes are meaningful (see below) — never return 200 for an error

### 3.3 HTTP Status Codes I Actually Use

```
200 OK              → successful GET, PUT, PATCH
201 Created         → successful POST
204 No Content      → successful DELETE (no body)
400 Bad Request     → validation failed, malformed body
401 Unauthorized    → not authenticated (no/invalid token)
403 Forbidden       → authenticated but not allowed
404 Not Found       → resource doesn't exist
409 Conflict        → duplicate, constraint violation
422 Unprocessable   → valid JSON but business logic rejection
429 Too Many Req    → rate limited
500 Internal Error  → something I didn't anticipate — always log these
```

### 3.4 Validation Rules

- Validate at the route/middleware layer, before the controller
- Never trust the client — validate even if the frontend already validated
- Return ALL validation errors at once, not just the first one:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "email", "message": "Must be a valid email address" },
      { "field": "admissionDate", "message": "Cannot be in the future" }
    ]
  },
  "data": null
}
```

### 3.5 Pagination — Always Use This Pattern

```
GET /api/v1/clients?page=1&limit=20&sort=createdAt&order=desc
```

Response `meta`:
```json
{
  "page": 1,
  "limit": 20,
  "total": 143,
  "totalPages": 8,
  "hasNext": true,
  "hasPrev": false
}
```

Default: `page=1`, `limit=20`, max limit: `100`

---

## 4. Error Handling Architecture

### The Golden Rule
> Every unhandled error must be caught at a single place and formatted consistently before reaching the client. No raw stack traces. No `[object Object]`. No silent failures.

### Node.js Pattern

```javascript
// middleware/errorHandler.js — the last middleware in app.js
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // Always log with context
  console.error({
    message: err.message,
    stack: isDev ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: { code: err.code, details: err.details ?? null },
      data: null
    });
  }

  // Unknown errors — never expose internals
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: { code: 'INTERNAL_ERROR', details: isDev ? err.message : null },
    data: null
  });
};
```

```javascript
// utils/AppError.js — throw this everywhere
class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

// Usage:
throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', validationErrors);
```

### Frontend Error Handling

```javascript
// api/client.js — all requests go through here
const apiClient = axios.create({ baseURL: '/api/v1' });

apiClient.interceptors.response.use(
  (response) => response.data,   // unwrap the envelope
  (error) => {
    const message = error.response?.data?.message ?? 'Something went wrong';
    const code = error.response?.data?.error?.code ?? 'UNKNOWN_ERROR';
    // Toast here, or re-throw for component-level handling
    toast.error(message);
    return Promise.reject({ message, code });
  }
);
```

---

## 5. Database Design Rules

### Naming
- Table/Collection names: plural, snake_case → `care_clients`, `payment_records`
- Column/Field names: snake_case in SQL → `created_at`, `sponsor_id`
- Field names in MongoDB: camelCase → `createdAt`, `sponsorId`
- Primary keys: always `id` (never `clientId` as a PK — that's redundant)
- Foreign keys: `{singular_table_name}_id` → `client_id`, `sponsor_id`
- Boolean fields: prefix with `is_` or `has_` → `is_active`, `has_sponsor`
- Timestamps: always `created_at` and `updated_at` on every table/document — non-negotiable

### Every Model Has These Fields (No Exceptions)
```
id          → primary identifier (UUID preferred over auto-increment)
created_at  → set on insert, never update
updated_at  → updated on every write (use hooks/triggers)
```

### Soft Delete Pattern
Never hard delete user-facing data. Add:
```
deleted_at  → null if active, timestamp if deleted
```
Filter all queries with `WHERE deleted_at IS NULL` by default.

### Indexing Rules
- Every foreign key gets an index
- Every field used in `WHERE` clauses in list queries gets an index
- Every field used for sorting gets an index
- Compound indexes: order matters — put the most selective field first

---

## 6. Authentication & Security Rules

- Passwords: always hashed with bcrypt (min 12 rounds) — never store plaintext
- Tokens: JWT with short expiry (15min access, 7day refresh) — store refresh in httpOnly cookie
- Never put sensitive data in JWT payload — just `userId` and `role`
- Rate limit all auth endpoints: max 5 attempts per 15 minutes per IP
- All routes require auth by default — explicitly whitelist public routes
- CORS: explicitly list allowed origins — never `*` in production
- Input sanitization: always sanitize before DB queries (even with ORMs)
- Never log passwords, tokens, or PII — use `[REDACTED]` placeholders
- Environment variables: never hardcode secrets — not even in comments

---

## 7. Frontend Architecture Rules

### Component Hierarchy
```
Page (route-level)
  └── Feature Component (stateful, connected to API)
        └── UI Component (stateless, receives props only)
              └── Base Component (button, input, badge — pure styling)
```

### Rules
- Pages never call APIs directly — use custom hooks or context
- UI components never import from `api/` — they receive data as props
- Never use inline styles — classNames only (Tailwind or CSS modules)
- Every form has controlled inputs — no uncontrolled inputs in production
- Loading, empty, and error states are required for every data-fetching component — not optional
- Never `console.log` in production — use a proper logger or remove before merge

### State Management
- Local UI state: `useState`
- Shared/server state: React Query or SWR (not Redux unless massive scale)
- Global app state (auth, theme): React Context — kept minimal
- Never store derived data in state — compute it from source data

### API Layer Pattern
```javascript
// api/clients.js — every resource gets its own file
export const clientsApi = {
  getAll: (params) => apiClient.get('/clients', { params }),
  getById: (id) => apiClient.get(`/clients/${id}`),
  create: (data) => apiClient.post('/clients', data),
  update: (id, data) => apiClient.put(`/clients/${id}`, data),
  discharge: (id) => apiClient.put(`/clients/${id}/discharge`),
  delete: (id) => apiClient.delete(`/clients/${id}`),
};
```

---

## 8. UI & Design System Rules

The visual identity changes per project. These structural rules do not.

### Color System
Every project defines a semantic color system — not raw hex values scattered in components:

```javascript
// Always defined as tokens, not raw values
colors: {
  // Semantic — what it means, not what it looks like
  'brand-primary'     // main action color
  'brand-secondary'   // supporting accent
  'surface-base'      // page background
  'surface-raised'    // cards, panels
  'surface-overlay'   // modals, dropdowns
  'border-default'    // standard borders
  'border-emphasis'   // focused/active borders
  'text-primary'      // headings, important content
  'text-secondary'    // body, labels
  'text-muted'        // hints, timestamps, disabled
  'status-success'    // positive states
  'status-warning'    // caution states
  'status-danger'     // errors, destructive
  'status-info'       // neutral information
}
```

### Typography Scale
Every project picks 2 fonts max:
- **Display font** — headings, numbers, hero text (characterful, distinctive)
- **Body font** — paragraphs, labels, UI text (clean, readable)
- **Mono font** — code, IDs, currency values, timestamps

### Spacing
- Always use the design system spacing scale — no arbitrary `px` values
- 4px base unit: 4, 8, 12, 16, 24, 32, 48, 64
- Consistent padding inside cards: always `p-6` (24px) desktop, `p-4` (16px) mobile

### Component States — Always Implement All 5
```
Default → Hover → Focus → Active → Disabled
```
Never ship a component with only a default state.

### Responsive Breakpoints — Always Mobile First
```
default  → mobile (< 640px)
sm:      → 640px+
md:      → 768px+
lg:      → 1024px+
xl:      → 1280px+
```

### Loading States — 3 Tiers
1. **Skeleton** — for initial page/section load (matches the layout it replaces)
2. **Spinner** — for inline actions (button submitting, small area refreshing)
3. **Overlay** — for blocking operations that can't be interrupted

---

## 9. Testing Standards

### The Testing Pyramid (Minimum Viable)
```
E2E tests        → critical user journeys only (5-10 tests)
Integration      → API endpoints with real DB (all routes)
Unit tests       → pure business logic functions (services, utils)
```

### What Must Always Be Tested
- Every API endpoint: happy path + common error cases
- Auth middleware: valid token, expired token, no token, wrong role
- Business logic: edge cases, zero values, null handling
- Frontend: form submission, error display, empty states

### Naming Convention
```javascript
describe('ClientService', () => {
  describe('createClient', () => {
    it('should create a client with valid data')
    it('should throw VALIDATION_ERROR if name is missing')
    it('should throw DUPLICATE_ERROR if client already exists')
  })
})
```

---

## 10. Documentation Rules

### Every Project Must Have

**README.md** (root):
```markdown
# Project Name
One line description.

## What it does
2-3 sentences max.

## Prerequisites
- Node 18+ / Go 1.21+
- MongoDB 6+ / PostgreSQL 15+

## Setup
git clone ...
cp .env.example .env
npm install
npm run dev

## Environment Variables
See .env.example — every variable is documented there.

## API Documentation
Link to Postman collection or `/api/docs` endpoint.

## Architecture
Brief note on key design decisions.
```

**Every API route must be documented** in a Postman collection (exported as JSON and committed to the repo under `/docs/postman.json`).

**Every non-obvious function needs a comment:**
```javascript
// Good comment — explains WHY, not WHAT
// We calculate balance at read-time rather than storing it
// because payment records can be backdated, which would
// invalidate a stored balance without triggering an update.
function calculateBalance(payments, monthlyFee) { ... }
```

---

## 11. The Pre-Ship Checklist

Before any project goes live or is handed to a client:

```
FUNCTIONALITY
[ ] All core user journeys work end-to-end
[ ] Forms validate and show errors correctly
[ ] Loading states exist for all async operations
[ ] Empty states exist for all lists/data views
[ ] Error states exist — what happens when the API fails?
[ ] 404 page exists and is styled

API
[ ] All endpoints return the standard response envelope
[ ] Auth is enforced on protected routes
[ ] Rate limiting is on auth endpoints
[ ] Input validation is on all POST/PUT/PATCH routes
[ ] Error handler catches unhandled errors

SECURITY
[ ] .env is in .gitignore (verify with git status)
[ ] No secrets hardcoded anywhere
[ ] CORS is configured for production domain only
[ ] Passwords are hashed (never stored plain)
[ ] Dependencies have no critical vulnerabilities (npm audit)

PERFORMANCE
[ ] Database queries are not inside loops
[ ] N+1 queries are eliminated (use populate/joins/batch)
[ ] Images are compressed and sized correctly
[ ] No unused dependencies

CODE QUALITY
[ ] No console.log in production code
[ ] No commented-out code blocks left in
[ ] Linter passes with zero errors
[ ] Build completes with zero errors
[ ] Environment variables documented in .env.example
```

---

## 12. The Benjie Fingerprint — Quick Reference

These are the things that make any project identifiably mine:

| Area | The Rule |
|------|----------|
| API responses | Always the `{ success, message, data, error }` envelope |
| Error handling | Single error handler, `AppError` class, never raw throws |
| URL design | Plural nouns, versioned, no verbs, nested max 2 deep |
| Folder structure | Controllers thin, services smart, repositories for DB |
| Commits | `type: description` — always, no exceptions |
| Timestamps | `created_at` / `updated_at` on every model, always |
| Frontend data | Never fetch in components — always through an api layer |
| Component states | All 5 states: default, hover, focus, active, disabled |
| Loading UX | Skeletons for layout, spinners for actions |
| Auth | JWT short-lived access + httpOnly refresh cookie |
| Secrets | Always in `.env`, always in `.env.example` with description |
| Docs | README + Postman collection committed to every repo |

---

*Last updated: 2025 — this document grows with every project.*
*If a project ships without following this doc, update this doc before shipping the next one.*