const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
const routes = require('./routes/index');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Webhooks need raw body — must come BEFORE express.json()
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(clerkMiddleware());

app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
