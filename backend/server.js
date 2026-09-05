const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Route Imports
const customerRoutes = require('./routes/customerRoutes');
const dealRoutes = require('./routes/dealRoutes');
const productRoutes = require('./routes/productRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const negotiationRoutes = require('./routes/negotiationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const fulfillmentRoutes = require('./routes/fulfillmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerPortalRoutes = require('./routes/customerPortalRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DealFlow360 Express + Supabase PostgreSQL Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/customer', customerPortalRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/fulfillment', fulfillmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 DealFlow360 Backend Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
