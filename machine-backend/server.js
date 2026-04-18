require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const machineRoutes = require('./routes/machineRoutes');
const layerRoutes  = require('./routes/layerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/machines', machineRoutes);

// Layer routes nested under machine: /api/machines/:id/layers
app.use('/api/machines/:id/layers', layerRoutes);

// Dashboard routes: /api/dashboard
app.use('/api/dashboard', dashboardRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏭 Machine Material Management API is running',
    version: '1.0.0',
    endpoints: {
      machines:        'GET    /api/machines',
      machine_detail:  'GET    /api/machines/:id         (A | B | C | D | E)',
      consent_get:     'GET    /api/machines/:id/consent',
      consent_update:  'PUT    /api/machines/:id/consent',
      layer_get:       'GET    /api/machines/:id/layers/:layer    (inner | middle | outer)',
      layer_add:       'POST   /api/machines/:id/layers/:layer',
      entry_get:       'GET    /api/machines/:id/layers/:layer/:entryId',
      entry_update:    'PUT    /api/machines/:id/layers/:layer/:entryId',
      entry_delete:    'DELETE /api/machines/:id/layers/:layer/:entryId',
      seed:            'POST   /api/machines/seed',
    },
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  console.log(`\n📌 Quick Start:\n   POST http://localhost:${PORT}/api/machines/seed  → Create all 5 machines`);
});
