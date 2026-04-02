const { Router } = require('express');
const { pool } = require('../config/db');

const router = Router();

router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: dbStatus,
  });
});

module.exports = router;
