const express = require('express');
const router = express.Router();
const db = require('../db');

// ─────────────────────────────────────────
//  POST /api/auth/register
// ─────────────────────────────────────────
router.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const allowedRoles = ['user', 'owner'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role. Use "user" or "owner".' });
    }

    // Check if email already exists
    const checkSql = 'SELECT id FROM users WHERE email = ?';
    db.query(checkSql, [email], (err, results) => {
        if (err) {
            console.error('Register check error:', err);
            return res.status(500).json({ success: false, message: 'Server error.' });
        }

        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }

        // Insert new user (plain text password - beginner friendly)
        const insertSql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        db.query(insertSql, [name, email, password, role], (err2, result) => {
            if (err2) {
                console.error('Register insert error:', err2);
                return res.status(500).json({ success: false, message: 'Could not create account.' });
            }

            res.json({
                success: true,
                message: 'Account created successfully!',
                user: { id: result.insertId, name, email, role }
            });
        });
    });
});

// ─────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const sql = 'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ success: false, message: 'Server error.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = results[0];
        res.json({
            success: true,
            message: 'Login successful!',
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    });
});

module.exports = router;
