# Kilo Configuration

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

## File Structure

```
carefacility/
├── server/
│   ├── controllers/
│   │   ├── clientController.js    # Client CRUD, discharge, debt summary
│   │   ├── paymentController.js    # Payment CRUD, monthly summary
│   │   └── dashboardController.js  # Dashboard stats
│   ├── routes/
│   │   ├── clients.js              # /api/clients/*
│   │   ├── payments.js             # /api/payments/*
│   │   └── dashboard.js            # /api/dashboard/*
│   └── models/
│       ├── Client.js
│       ├── Payment.js
│       └── Alert.js
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dashboard with revenue/debt drill-down
│   │   │   ├── ClientsPage.jsx     # Clients list with filtering
│   │   │   └── ClientDetailPage.jsx # Client detail + delete/discharge
│   │   ├── components/
│   │   │   ├── RevenueDetails.jsx  # Revenue drill-down modal
│   │   │   ├── DebtDetails.jsx     # Debt drill-down modal
│   │   │   └── ToastNotifications.jsx
│   │   └── utils/
│   │       └── api.js              # All API clients
│   └── package.json
└── kilo.json
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Main dashboard statistics

### Clients
- `GET /api/clients` - List all clients (with query params)
- `GET /api/clients/filter/:status` - Filter by status
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `PUT /api/clients/:id/discharge` - Discharge client
- `DELETE /api/clients/:id` - Delete client permanently
- `GET /api/clients/debt-summary` - Get clients with outstanding debt

### Payments
- `GET /api/payments` - List payments (with query params)
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/monthly-summary` - Monthly revenue summary

## Key Features

### Client Deletion
- Permanent delete removes client and all associated payments/alerts
- Confirmation modal with warning
- Redirects to /clients after successful deletion

### Discharge
- Changes status from 'active' to 'discharged'
- Sets discharge date
- Does NOT delete client or payments

### Revenue Drill-Down
- Click Revenue card on Dashboard
- Shows monthly payment summaries
- Expandable months with individual payment details
- Client names clickable (navigates to client detail)

### Debt Drill-Down
- Click Debt card on Dashboard  
- Shows clients with outstanding balance
- Color-coded by overdue days:
  - Red: >30 days overdue
  - Yellow: 15-30 days overdue  
  - Green: <15 days overdue
- Client names clickable (navigates to client detail)

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
