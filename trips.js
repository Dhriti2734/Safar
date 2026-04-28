const express = require('express');
const router = express.Router();
const db = require('../db');

// ─────────────────────────────────────────
//  POST /api/trips/add   (Owner adds a trip)
// ─────────────────────────────────────────
router.post('/add', (req, res) => {
    const { title, location, price, image, organizer_id } = req.body;

    if (!title || !location || !price || !organizer_id) {
        return res.status(400).json({ success: false, message: 'title, location, price and organizer_id are required.' });
    }

    const sql = 'INSERT INTO trips (title, location, price, image, organizer_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [title, location, price, image || '', organizer_id], (err, result) => {
        if (err) {
            console.error('Add trip error:', err);
            return res.status(500).json({ success: false, message: 'Could not add trip.' });
        }

        res.json({
            success: true,
            message: 'Trip added successfully!',
            trip: { id: result.insertId, title, location, price, image, organizer_id }
        });
    });
});

// ─────────────────────────────────────────
//  GET /api/trips        (All users see all trips)
// ─────────────────────────────────────────
router.get('/', (req, res) => {
    const sql = `
        SELECT t.id, t.title, t.location, t.price, t.image,
               u.name AS organizer_name, u.email AS organizer_email
        FROM trips t
        LEFT JOIN users u ON t.organizer_id = u.id
        ORDER BY t.id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Get trips error:', err);
            return res.status(500).json({ success: false, message: 'Could not fetch trips.' });
        }

        res.json({ success: true, trips: results });
    });
});

// ─────────────────────────────────────────
//  GET /api/trips/my?organizer_id=X  (Owner's own trips)
// ─────────────────────────────────────────
router.get('/my', (req, res) => {
    const { organizer_id } = req.query;

    if (!organizer_id) {
        return res.status(400).json({ success: false, message: 'organizer_id query param is required.' });
    }

    const sql = 'SELECT * FROM trips WHERE organizer_id = ? ORDER BY id DESC';
    db.query(sql, [organizer_id], (err, results) => {
        if (err) {
            console.error('Get my trips error:', err);
            return res.status(500).json({ success: false, message: 'Could not fetch your trips.' });
        }

        res.json({ success: true, trips: results });
    });
});

// ─────────────────────────────────────────
//  DELETE /api/trips/:id  (Owner deletes a trip)
// ─────────────────────────────────────────
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const { organizer_id } = req.body;

    // Only delete if organizer owns the trip
    const sql = 'DELETE FROM trips WHERE id = ? AND organizer_id = ?';
    db.query(sql, [id, organizer_id], (err, result) => {
        if (err) {
            console.error('Delete trip error:', err);
            return res.status(500).json({ success: false, message: 'Could not delete trip.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
        }

        res.json({ success: true, message: 'Trip deleted.' });
    });
});

module.exports = router;
