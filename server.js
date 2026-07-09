/**
 * Sample Node.js Payment Service
 * Intentionally contains security vulnerabilities to test PR Security Guard.
 * DO NOT use this code in production.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
const app = express();
app.use(express.json());

// ── CRITICAL: Hardcoded secrets ────────────────────────────────────────────
const API_KEY = "mK8pQ2rT5vW9xZ3aB6cD1eF4gH7jL0nP";
const JWT_SECRET = "MySecretKey123!ProdBanking";
const DB_PASSWORD = "Lloyds@PaymentDB2024";

const DB_URL = "mongodb://admin:SuperSecret123@prod-db.internal:27017/payments";

// ── HIGH: SQL injection via string concatenation ───────────────────────────
app.get('/account/:id', (req, res) => {
  const accountId = req.params.id;
  const query = "SELECT * FROM accounts WHERE id = " + accountId;
  db.query(query, (err, result) => {
    res.json(result);
  });
});

// ── HIGH: Command injection ─────────────────────────────────────────────────
app.post('/generate-report', (req, res) => {
  const filename = req.body.filename;
  exec('generate-report ' + filename, (err, stdout) => {
    res.send(stdout);
  });
});

// ── HIGH: JWT not properly verified ─────────────────────────────────────────
app.post('/verify-token', (req, res) => {
  const token = req.headers.authorization;
  const decoded = jwt.decode(token);  // decode() does NOT verify signature!
  res.json({ user: decoded });
});

// ── MEDIUM: Sensitive data in logs ──────────────────────────────────────────
app.post('/process-payment', (req, res) => {
  const { cardNumber, cvv, amount } = req.body;
  console.log("Processing payment: card=" + cardNumber + " cvv=" + cvv + " amount=" + amount);
  res.json({ status: "processed" });
});

// ── MEDIUM: CORS wildcard ───────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// ── MEDIUM: Insecure randomness for security tokens ─────────────────────────
function generateResetToken() {
  return Math.random().toString(36).substring(2);
}

// ── HIGH: XSS — unescaped user input rendered directly ──────────────────────
app.get('/welcome', (req, res) => {
  const name = req.query.name;
  res.send('<h1>Welcome, ' + name + '</h1>');
});

app.listen(3000, () => console.log('Payment service running on port 3000'));
