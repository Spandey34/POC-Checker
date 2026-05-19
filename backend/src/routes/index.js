const express = require('express');
const router = express.Router();

router.use('/users', require('./userRoutes'));
router.use('/pocs', require('./pocRoutes'));
router.use('/recent', require('./recentRoutes'));

// Global error handler
router.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

module.exports = router;
