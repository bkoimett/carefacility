# CareTrack – Client Care Facility Fee Management System

A full-stack MERN application for managing client billing at a care facility, including complex fee structures, automatic daily charges after duration expiry, a payment ledger, sponsor management, and an intelligent alert system.

---

## ✨ Features

- **Dashboard** – Revenue trend charts, outstanding debt, recent payments, alert summary cards
- **Client Management** – Full CRUD with admission, fee negotiation per client, discharge/abscond tracking
- **Sponsor Management** – Separate sponsor entity linked to multiple clients
- **Billing Engine** – Computes full charge schedule: Month 1 (monthly + medical), Months 2–N (monthly only), post-expiry daily charges (1,500 KES/day default)
- **Payment Ledger** – Full transaction log with running balance, supports negative amounts (credits/overpayments)
- **Alert System** – 6 alert types auto-generated daily via node-cron, dismissible inbox UI
- **Comment Directives** – Parse special instructions from client comments (`RESET_BILLING`, `IGNORE_ALERT:EXPIRY`, `MANUAL_BILLING:true`)
- **Theme Switcher** – Light (careclinic) / Dark (carenight) themes via daisyUI

---

## 🗂 Project Structure

```
carefacility/
├── server/
│   ├── models/
│   │   ├── Client.js        # Client schema with billing fields
│   │   ├── Sponsor.js       # Sponsor entity
│   │   ├── Payment.js       # Payment ledger entry
│   │   └── Alert.js         # Alert with deduplication index
│   ├── controllers/
│   │   ├── clientController.js
│   │   ├── sponsorController.js
│   │   ├── paymentController.js
│   │   ├── alertController.js
│   │   └── dashboardController.js
│   ├── routes/              # Express routers
│   ├── utils/
│   │   ├── billingEngine.js # ★ Core business logic
│   │   └── cronJobs.js      # Daily alert generation
│   ├── seed.js              # Demo data seeder
│   └── index.js             # Server entry point
└── client/
    └── src/
        ├── pages/           # Dashboard, Clients, ClientDetail, Sponsors, Alerts
        ├── components/
        │   ├── ui/          # Reusable: Modal, StatCard, Spinner, etc.
        │   ├── clients/     # ClientForm
        │   ├── payments/    # PaymentForm, PaymentLedger, BillingBreakdown
        │   └── sponsors/    # SponsorForm
        ├── utils/
        │   ├── api.js       # Axios client + all API functions
        │   └── formatters.js
        ├── hooks/
        │   └── useFetch.js  # Data fetching hooks
        └── context/
            └── ThemeContext.jsx
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone & install
```bash
git clone <repo-url>
cd carefacility
npm run install:all
```

### 2. Configure server environment
```bash
cd server
cp .env.example .env
# Edit .env:
# MONGO_URI=mongodb://localhost:27017/carefacility
# DAILY_RATE_AFTER_EXPIRY=1500
# PORT=5000
```

### 3. Seed demo data (optional)
```bash
cd server
node seed.js
```
This creates 3 sponsors, 5 clients (including one post-expiry, one with credit), and 13 payments.

### 4. Run development servers
```bash
# From project root – starts both server (port 5000) + client (port 5173)
npm run dev
```

Then open: **http://localhost:5173**

---

## 💰 Business Logic Reference

### Fee Structure Per Client
| Period | Charge |
|--------|--------|
| Month 1 (days 0–30) | `monthlyFee` + `medicalFee` |
| Months 2 → `agreedDurationMonths` | `monthlyFee` only (every 30 days) |
| After `agreedDurationMonths` × 30 days | `1,500 KES/day` (or `customDailyRate`) |

### Payment Rules
- Deposit (KES 10,000–20,000) recorded at admission automatically
- Negative payment amount = overpayment/credit → applied to running balance
- Balance = Total Paid − Total Charged (positive = credit, negative = owes)

### Alert Triggers
| Alert | When |
|-------|------|
| `FIRST_MONTH_DUE` | Day 25+ if first month not fully paid |
| `SPONSOR_REMINDER` | Days 30–32 after admission |
| `MONTHLY_FEE_DUE` | 5 days past each monthly due date |
| `EXPIRY_WARNING` | At 83% of agreed duration |
| `EXPIRY_OVERDUE` | Day 1 post-expiry (daily charges begin) |
| `DAILY_CHARGE_ALERT` | Every 7 days while in post-expiry |

Alerts for discharged/absconded clients are suppressed automatically.

### Comment Directives
Add these to a client's **Comments** field to control billing behaviour:

```
IGNORE_ALERT:EXPIRY              → Suppress all expiry-related alerts
MANUAL_BILLING:true              → Suppress all automated billing alerts
RESET_BILLING:monthly=45000,medical=20000  → Restart billing with new fee terms
```

### Client Statuses
| Status | Behaviour |
|--------|-----------|
| `active` | Normal billing + alert generation |
| `discharged` | All billing and alerts frozen |
| `absconded` | Same as discharged for billing, flagged separately |

---

## 🔌 API Reference

### Clients
```
GET    /api/clients               ?search=, status=, page=, limit=
GET    /api/clients/:id           Full detail with billing + payments + alerts
POST   /api/clients               Create client (auto-records deposit payment)
PUT    /api/clients/:id           Update (parses RESET_BILLING from comments)
DELETE /api/clients/:id           Cascade deletes payments + alerts
GET    /api/clients/:id/billing   Just the billing breakdown
```

### Payments
```
GET    /api/payments              ?clientId=, page=, limit=
POST   /api/payments              Record payment (returns updated billing)
PUT    /api/payments/:id
DELETE /api/payments/:id
```

### Sponsors
```
GET    /api/sponsors              ?search=
GET    /api/sponsors/:id          Includes linked clients list
POST   /api/sponsors
PUT    /api/sponsors/:id
DELETE /api/sponsors/:id          Unlinks clients automatically
```

### Alerts
```
GET    /api/alerts                ?clientId=, isRead=, severity=, isDismissed=
PUT    /api/alerts/:id/read
PUT    /api/alerts/:id/dismiss
PUT    /api/alerts/mark-all-read
POST   /api/alerts/trigger-job   Manually trigger daily alert check
```

### Dashboard
```
GET    /api/dashboard/stats       All summary stats + trends + recent payments
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/carefacility` | MongoDB connection string |
| `PORT` | `5000` | Express server port |
| `DAILY_RATE_AFTER_EXPIRY` | `1500` | KES per day after agreed duration expires |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin for frontend |
| `NODE_ENV` | `development` | Environment flag |

---

## 🧠 Key Design Decisions

1. **Billing computed on-the-fly** – `billingEngine.js` re-calculates totals from raw payments each request. No denormalised "balance" field that can drift out of sync.

2. **Alert deduplication** – Unique compound index on `(client, alertType, periodKey)` ensures cron job never creates duplicate alerts for the same billing period.

3. **Negative payments** – The system treats any negative `amount` as a credit, automatically reducing the outstanding balance. No separate "credit note" model needed.

4. **Comment directives** – A lightweight way for admins to override billing logic without needing a dedicated UI flow for every edge case.
