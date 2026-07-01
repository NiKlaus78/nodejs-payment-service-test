# Node.js Payment Service — Sample Vulnerable Project

This is a deliberately vulnerable sample project for testing PR Security Guard
against JavaScript/Node.js code and npm dependencies.

## Setup

1. Create a new GitHub repo, e.g. `nodejs-payment-service-test`
2. Push this folder's contents as the initial commit on `main`
3. Register the PR Security Guard webhook on this repo (Settings → Webhooks)
4. Create a new branch, modify `server.js` or `package.json`, open a PR

## What should get flagged

**From `package.json` (npm/OSV CVE scan):**
- `lodash@4.17.20` — CVE-2021-23337 (command injection via template)
- `jsonwebtoken@8.5.1` — multiple known CVEs in older 8.x versions
- `axios@0.21.0` — CVE-2021-3749 (SSRF / ReDoS)

**From `server.js` (Mistral Codestral semantic analysis + regex prefilter):**
- Hardcoded API key, JWT secret, DB password (CRITICAL)
- MongoDB connection string with embedded credentials (CRITICAL)
- SQL injection via string concatenation (HIGH)
- Command injection via `exec()` with unsanitized input (HIGH)
- `jwt.decode()` instead of `jwt.verify()` — signature not checked (HIGH)
- Card number and CVV logged in plaintext (MEDIUM — PCI violation)
- CORS wildcard origin (MEDIUM)
- `Math.random()` used for security tokens (MEDIUM — insecure randomness)
- XSS via unescaped user input in HTML response (HIGH)

## Expected result

PR should be **BLOCKED** with multiple CRITICAL and HIGH findings posted as
PR comments, plus a summary table. This validates the agent works correctly
on JavaScript/Node.js code, not just Java.
