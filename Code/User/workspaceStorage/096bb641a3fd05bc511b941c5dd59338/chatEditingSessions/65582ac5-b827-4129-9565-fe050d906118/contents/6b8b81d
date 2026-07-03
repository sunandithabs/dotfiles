const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Basic rate limiter
const limiter = rateLimit({ windowMs: 1000, max: 20 });
app.use('/api/', limiter);

// Serve static frontend (project root)
const staticRoot = path.join(__dirname, '..');
app.use(express.static(staticRoot));

// Simple seed data for demo endpoints
const seedPath = path.join(__dirname, 'data', 'seed.json');
let seed = {};
try { seed = JSON.parse(fs.readFileSync(seedPath, 'utf8')); } catch (e) { seed = { hello: 'no-seed' }; }

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// Demo data endpoint
app.get('/api/demo', (req, res) => {
  res.json({ status: 'ok', seed: seed });
});

// Simple login endpoint (demo only) - validates against seed users
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = (seed.users || []).find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  // Return a minimal session token (insecure demo token)
  return res.json({ token: `demo-token-${user.id}`, user });
});

app.listen(PORT, () => {
  console.log(`Simulyn server (dev) listening on http://localhost:${PORT}`);
});
