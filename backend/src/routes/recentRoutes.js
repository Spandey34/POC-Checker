const express = require('express');

const router = express.Router();
const { getRecentActivities } = require('../controllers/recentController');

const authenticate =
  require('../middleware/auth');

const isAdmin =
  require('../middleware/isAdmin');


router.get('/', authenticate, isAdmin, getRecentActivities);

module.exports = router;