const express = require('express');
const { checkConnection } = require('../db');

const router = express.Router();

router.get('/health', async (req, res) => {
  const dbOk = await checkConnection();
  const status = dbOk ? 'ok' : 'degraded';
  const code = dbOk ? 200 : 503;

  res.status(code).json({
    status,
    uptimeSeconds: Math.floor(process.uptime()),
    db: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;