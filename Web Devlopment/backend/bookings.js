const express = require('express');
const router = express.Router();
const db = require('../db');

// ─────────────────────────────────────────
//  POST /api/bookings/hotel   (User books a hotel / sends bargain)
// ─────────────────────────────────────────
router.post('/hotel', (req, res) => {
    const { user_id, property_name, original_price, offered_price, owner_email, checkin, checkout, guests, city } = req.body;

    if (!user_id || !property_name || !checkin || !checkout) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const sql = `INSERT INTO hotel_bookings
        (user_id, property_name, original_price, offered_price, owner_email, checkin, checkout, guests, city, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`;

    db.query(sql, [user_id, property_name, original_price, offered_price || original_price, owner_email, checkin, checkout, guests || 1, city || ''], (err, result) => {
        if (err) {
            console.error('Hotel booking error:', err);
            return res.status(500).json({ success: false, message: 'Could not save booking.' });
        }

        res.json({
            success: true,
            message: 'Booking request sent to owner!',
            booking_id: result.insertId
        });
    });
});

// ─────────────────────────────────────────
//  POST /api/bookings/activity  (User books an activity)
// ─────────────────────────────────────────
router.post('/activity', (req, res) => {
    const { user_id, activity_name, city, date, people, price_per_person, total, contact_name, phone, special } = req.body;

    if (!user_id || !activity_name || !date || !contact_name || !phone) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const sql = `INSERT INTO activity_bookings
        (user_id, activity_name, city, date, people, price_per_person, total, contact_name, phone, special, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')`;

    db.query(sql, [user_id, activity_name, city, date, people || 1, price_per_person, total, contact_name, phone, special || ''], (err, result) => {
        if (err) {
            console.error('Activity booking error:', err);
            return res.status(500).json({ success: false, message: 'Could not save booking.' });
        }

        res.json({
            success: true,
            message: 'Activity booked successfully!',
            booking_id: result.insertId,
            ref: 'ACT-' + String(result.insertId).padStart(8, '0')
        });
    });
});

// ─────────────────────────────────────────
//  GET /api/bookings/user/:user_id   (User's all bookings)
// ─────────────────────────────────────────
router.get('/user/:user_id', (req, res) => {
    const { user_id } = req.params;

    const hotelSql = 'SELECT *, "hotel" AS type FROM hotel_bookings WHERE user_id = ? ORDER BY id DESC';
    const actSql   = 'SELECT *, "activity" AS type FROM activity_bookings WHERE user_id = ? ORDER BY id DESC';

    db.query(hotelSql, [user_id], (err1, hotelResults) => {
        if (err1) {
            console.error('Get hotel bookings error:', err1);
            return res.status(500).json({ success: false, message: 'Server error.' });
        }

        db.query(actSql, [user_id], (err2, actResults) => {
            if (err2) {
                console.error('Get activity bookings error:', err2);
                return res.status(500).json({ success: false, message: 'Server error.' });
            }

            res.json({
                success: true,
                hotel_bookings: hotelResults,
                activity_bookings: actResults
            });
        });
    });
});

// ─────────────────────────────────────────
//  GET /api/bookings/owner/:owner_email  (Owner sees requests for their properties)
// ─────────────────────────────────────────
router.get('/owner/:owner_email', (req, res) => {
    const { owner_email } = req.params;

    const sql = `
        SELECT hb.*, u.name AS user_name
        FROM hotel_bookings hb
        LEFT JOIN users u ON hb.user_id = u.id
        WHERE hb.owner_email = ?
        ORDER BY hb.id DESC
    `;

    db.query(sql, [owner_email], (err, results) => {
        if (err) {
            console.error('Get owner bookings error:', err);
            return res.status(500).json({ success: false, message: 'Server error.' });
        }

        res.json({ success: true, bookings: results });
    });
});

// ─────────────────────────────────────────
//  PATCH /api/bookings/hotel/:id/status  (Owner accepts/rejects)
// ─────────────────────────────────────────
router.patch('/hotel/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;  // 'Accepted' or 'Rejected'

    const allowed = ['Accepted', 'Rejected', 'Paid & Confirmed'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const sql = 'UPDATE hotel_bookings SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error('Update booking status error:', err);
            return res.status(500).json({ success: false, message: 'Could not update status.' });
        }

        res.json({ success: true, message: `Booking ${status}.` });
    });
});

module.exports = router;
