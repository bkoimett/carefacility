require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');

const clientRoutes = require('./routes/clients');
const sponsorRoutes = require('./routes/sponsors');
const paymentRoutes = require('./routes/payments');
const alertRoutes = require('./routes/alerts');
const dashboardRoutes = require('./routes/dashboard');

const { runDailyAlertJob } = require('./utils/cronJobs');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
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
