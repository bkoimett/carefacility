# Kilo Configuration

## Project Overview

CareFacility is a healthcare billing management system for residential care facilities. It tracks clients, payments, sponsors, and alerts with automated debt tracking and notifications.

**Stack:** React 18 + Vite, Express.js, MongoDB/Mongoose, Tailwind CSS + DaisyUI, Recharts

---

## Project Setup

### Running the application
```bash
# Full dev environment (server + client)
npm run dev

# Server only (port 5000)
npm run server

# Client only (port 5173)
npm run client

# Install all dependencies
npm run install:all
```

### Testing
```bash
# Client tests
cd client && npm test

# Server - run with nodemon
cd server && npm run dev
```

---

## File Structure

```
carefacility/
├── server/
│   ├── index.js                    # Express app entry, MongoDB connect
│   ├── controllers/
│   │   ├── clientController.js     # Client CRUD, discharge, debt summary
│   │   ├── paymentController.js    # Payment CRUD, monthly summary
│   │   ├── sponsorController.js    # Sponsor CRUD
│   │   ├── alertController.js      # Alert CRUD, read/dismiss
│   │   └── dashboardController.js  # Dashboard stats, revenue trend
│   ├── routes/
│   │   ├── clients.js              # /api/clients/*
│   │   ├── sponsors.js             # /api/sponsors/*
│   │   ├── payments.js             # /api/payments/*
│   │   ├── alerts.js               # /api/alerts/*
│   │   └── dashboard.js            # /api/dashboard/*
│   ├── models/
│   │   ├── Client.js               # name, admission, fees, status
│   │   ├── Payment.js              # client ref, amount, date, type
│   │   ├── Sponsor.js              # name, contact, payment terms
│   │   └── Alert.js                # client ref, type, severity, message
│   └── utils/
│       ├── cronJobs.js             # Daily alert job scheduling
│       └── billingEngine.js        # Balance calculation logic
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js          # Custom themes: careclinic, carenight
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Router with Layout wrapper
│       ├── index.css               # Tailwind + DaisyUI imports
│       ├── context/
│       │   └── ThemeContext.jsx    # Light/dark theme toggle
│       ├── pages/
│       │   ├── Dashboard.jsx       # Stats, charts, recent payments/alerts
│       │   ├── ClientsPage.jsx     # Client list with filters
│       │   ├── ClientDetailPage.jsx # Client detail + payments
│       │   ├── SponsorsPage.jsx    # Sponsor management
│       │   └── AlertsPage.jsx      # Alert list with mark read/dismiss
│       ├── components/
│       │   ├── ui/
│       │   │   ├── index.jsx       # UI exports
│       │   │   └── Layout.jsx        # Sidebar nav, top bar
│       │   ├── RevenueDetails.jsx  # Revenue drill-down modal
│       │   ├── DebtDetails.jsx     # Debt drill-down modal
│       │   ├── ToastNotifications.jsx
│       │   ├── SkeletonLoader.jsx
│       │   ├── LoadingSpinner.jsx
│       │   ├── ErrorBoundary.jsx
│       │   ├── ValidationSummary.jsx
│       │   ├── clients/ClientForm.jsx
│       │   ├── sponsors/SponsorForm.jsx
│       │   └── payments/
│       │       ├── PaymentLedger.jsx
│       │       ├── PaymentForm.jsx
│       │       └── BillingBreakdown.jsx
│       └── utils/
│           ├── api.js              # Axios clients for all endpoints
│           ├── formatters.js       # Currency/date formatting
│           └── hooks/
│               └── useFetch.js
└── .env.example                    # MONGODB_URI, CLIENT_URL
```

---

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Overview stats (clients, revenue, alerts, overdue)
- `GET /api/dashboard/revenue-trend` - Monthly revenue data for charts

### Clients
- `GET /api/clients` - List all clients (with query params: status, search)
- `GET /api/clients/filter/:status` - Filter by status (active, discharged, absconded)
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `PUT /api/clients/:id/discharge` - Discharge client (sets status, date)
- `DELETE /api/clients/:id` - Delete client permanently (cascades to payments/alerts)
- `GET /api/clients/debt-summary` - Clients with outstanding balance

### Payments
- `GET /api/payments` - List payments (with query params: client, month, year)
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/monthly-summary` - Monthly revenue summary

### Sponsors
- `GET /api/sponsors` - List all sponsors
- `GET /api/sponsors/:id` - Get single sponsor
- `POST /api/sponsors` - Create sponsor
- `PUT /api/sponsors/:id` - Update sponsor
- `DELETE /api/sponsors/:id` - Delete sponsor

### Alerts
- `GET /api/alerts` - List alerts (with query params: severity, isRead, isDismissed)
- `PUT /api/alerts/:id/read` - Mark alert as read
- `PUT /api/alerts/:id/dismiss` - Dismiss alert

---

## Key Features

### Dashboard
- Stat cards: Active Clients, Revenue, Outstanding Debt, Alerts
- Revenue trend (AreaChart) and payment volume (BarChart)
- Most overdue clients list
- Recent alerts list
- Recent payments table

### Client Management
- List with status filters (active, discharged, absconded)
- Create/edit form with validation
- Detail view with payment ledger
- Permanent delete with confirmation

### Payment Tracking
- Record payments with type (monthly fee, medical fee, deposit, adjustment)
- Payment ledger per client
- Monthly summaries

### Alerts System
- Auto-generated for overdue balances
- Severity levels: critical, warning, info
- Daily cron job for alert generation

---

## Premium UI Build Instructions for Claude

```
You are building a premium modern UI for CareFacility, a healthcare billing management system.

PROJECT CONTEXT:
- React 18 + Vite, Express.js/MongoDB backend, Tailwind CSS + DaisyUI
- Current UI uses DaisyUI components with custom "careclinic" and "carenight" themes
- Custom fonts: DM Serif Display (headings), DM Sans (body), JetBrains Mono (monospace)

CURRENT DESIGN:
- Light theme: blues (#0f4c75 primary) on light gray background (#f7f9fc)
- Dark theme: blues (#3b82f6 primary) on dark slate (#0f172a)
- Uses stat cards, tables, charts (Recharts), modals

BUILD REQUIREMENTS:
1. Create a FLAT, APP-INTERNAL, MODERN ENTERPRISE DASHBOARD aesthetic
2. Focus on minimalism: flat design, subtle shadows, clean typography
3. Use muted professional colors: slate, gray, blue-gray palette
4. Implement smooth transitions and micro-interactions
5. Responsive grid layouts with proper spacing (4-6 spacing scale)
6. Keep DaisyUI as base but override with custom premium styles

NEW DESIGN SPEC:
- Card-based layout with subtle borders (not shadows)
- Flat buttons with hover states (no gradients)
- Consistent 8px border-radius
- Professional data visualization styling
- Improved color hierarchy for status badges
- Clean form inputs with focus states
- Modern loading skeletons and empty states

KEY PAGES TO UPDATE:
- Dashboard.jsx - stat cards, charts, tables
- ClientsPage.jsx - client list, filters
- ClientDetailPage.jsx - tabs for details/payments
- SponsorsPage.jsx - sponsor list and forms
- AlertsPage.jsx - alert management

FILE STRUCTURE FOR UI:
- client/src/pages/*.jsx - main page components
- client/src/components/ui/* - reusable UI components
- client/src/index.css - global styles
- tailwind.config.js - theme configuration

DO NOT:
- Change existing component props or API integration
- Break responsive behavior
- Remove existing functionality
- Change routing structure

START WITH: Dashboard.jsx - modernize the stat cards and charts section
```

---

## Lint/Type Check
```bash
# Server
cd server && node -c controllers/*.js

# Client
cd client && npx vite build
```

## Notes
- Uses Mongoose for MongoDB models
- Client uses date-fns for date operations
- Dashboard uses recharts for visualizations
- DaisyUI for styling (Tailwind UI components)
- Toast notifications via react-hot-toast
- Custom themes: "careclinic" (light) and "carenight" (dark)