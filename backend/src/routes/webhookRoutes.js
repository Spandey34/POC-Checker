const express = require('express');
const router = express.Router();
const { handleClerkWebhook } = require('../controllers/webhookController');

router.post('/clerk', handleClerkWebhook);

module.exports = router;
