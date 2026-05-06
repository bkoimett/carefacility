require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cron = require('node-cron');

const clientRoutes = require('./routes/clients');
const sponsorRoutes = require('./routes/sponsors');
const paymentRoutes = require('./routes/payments');
const alertRoutes = require('./routes/alerts');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');

const { protect } = require('./middleware/auth');

const { runDailyAlertJob } = require('./utils/cronJobs');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Incoming`);
  
  // Log request body for POST/PUT (excluding sensitive data for login)
  if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    if (req.url.includes('login') || req.url.includes('register')) {
      logBody.password = '[REDACTED]';
    }
    console.log(`[${new Date().toISOString()}] Request body:`, JSON.stringify(logBody));
  }

  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? '🔴' : status >= 400 ? '🟠' : status >= 300 ? '🟡' : '🟢';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${statusColor} ${status} ${duration}ms`);
    if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
      console.log(`[${new Date().toISOString()}] Response:`, JSON.stringify(body).substring(0, 500));
    }
    return originalSend.call(this, body);
  };
  next();
});

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://carefacility-git-main-bwanachairmans-projects.vercel.app',
  /.vercel\.app$/,
  /.vercel\.sh$/,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check against allowed origins (including regex patterns)
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`[${new Date().toISOString()}] CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', protect, clientRoutes);
app.use('/api/sponsors', protect, sponsorRoutes);
app.use('/api/payments', protect, paymentRoutes);
app.use('/api/alerts', protect, alertRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ❌ Error:`, err.stack);
  
  // CORS error handling
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS blocked: Origin not allowed',
      error: { code: 'CORS_ERROR' }
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

console.log('MONGODB_URI exists?', !!MONGODB_URI);
console.log('All env vars:', Object.keys(process.env));

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Schedule daily alert job at midnight
    cron.schedule(process.env.ALERT_CRON || '0 0 * * *', () => {
      console.log('⏰ Running daily alert job...');
      runDailyAlertJob();
    });

    // Run once on startup to catch up
    runDailyAlertJob();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
