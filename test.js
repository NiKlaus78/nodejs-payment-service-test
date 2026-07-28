/**
 * Sample Node.js User Management Service
 * Intentionally contains security vulnerabilities for security scanner testing.
 * DO NOT use this code in production.
 */

const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());

// ── CRITICAL: Hardcoded credentials ─────────────────────────────────────────
const ADMIN_USERNAME = "superadmin";
const ADMIN_PASSWORD = "Admin@123456";
const ENCRYPTION_KEY = "12345678901234567890123456789012";

// ── HIGH: Path Traversal ────────────────────────────────────────────────────
app.get('/download', (req, res) => {
    const file = req.query.file;
    fs.readFile("./uploads/" + file, (err, data) => {
        if (err) return res.status(404).send("File not found");
        res.send(data);
    });
});

// ── HIGH: Weak Password Hashing (MD5) ───────────────────────────────────────
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = crypto
        .createHash('md5')
        .update(password)
        .digest('hex');

    console.log("Saving:", username, hashedPassword);

    res.json({
        message: "User registered",
        hash: hashedPassword
    });
});

// ── HIGH: Missing Authorization Check ───────────────────────────────────────
app.delete('/admin/delete-user/:id', (req, res) => {
    const userId = req.params.id;

    // No authentication or authorization
    res.json({
        message: `User ${userId} deleted`
    });
});

// ── MEDIUM: Open Redirect ───────────────────────────────────────────────────
app.get('/redirect', (req, res) => {
    const target = req.query.url;
    res.redirect(target);
});

// ── MEDIUM: User Enumeration ────────────────────────────────────────────────
const users = ["alice", "bob", "charlie"];

app.post('/login', (req, res) => {
    const { username } = req.body;

    if (!users.includes(username)) {
        return res.status(404).send("User does not exist");
    }

    res.send("Password incorrect");
});

// ── MEDIUM: Missing Rate Limiting ───────────────────────────────────────────
app.post('/otp', (req, res) => {
    const { mobile } = req.body;

    console.log(`OTP sent to ${mobile}`);

    res.json({
        status: "OTP Sent"
    });
});

// ── LOW: Information Disclosure ─────────────────────────────────────────────
app.get('/config', (req, res) => {
    res.json({
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
    });
});

// ── LOW: Stack Trace Disclosure ─────────────────────────────────────────────
app.get('/crash', (req, res) => {
    try {
        throw new Error("Database connection failed");
    } catch (err) {
        res.status(500).send(err.stack);
    }
});

// ── LOW: Cookie Without Security Flags ──────────────────────────────────────
app.get('/session', (req, res) => {
    res.cookie("sessionId", "abc123");
    res.send("Session created");
});

app.listen(4000, () => {
    console.log("User Management Service running on port 4000");
});