const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());                          // Allow cross-origin requests from frontend
app.use(express.json());                  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Serve frontend files statically (images, HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Routes ──────────────────────────────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const tripsRoutes    = require('./routes/trips');
const bookingsRoutes = require('./routes/bookings');

app.use('/api/auth',     authRoutes);
app.use('/api/trips',    tripsRoutes);
app.use('/api/bookings', bookingsRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Safar backend is running ✅' });
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Safar backend running at: http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from:    ../frontend/`);
    console.log(`\nAPI Endpoints:`);
    console.log(`  POST   /api/auth/register`);
    console.log(`  POST   /api/auth/login`);
    console.log(`  GET    /api/trips`);
    console.log(`  GET    /api/trips/my?organizer_id=X`);
    console.log(`  POST   /api/trips/add`);
    console.log(`  DELETE /api/trips/:id`);
    console.log(`  POST   /api/bookings/hotel`);
    console.log(`  POST   /api/bookings/activity`);
    console.log(`  GET    /api/bookings/user/:user_id`);
    console.log(`  GET    /api/bookings/owner/:owner_email`);
    console.log(`  PATCH  /api/bookings/hotel/:id/status\n`);
});
