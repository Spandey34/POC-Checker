const express = require('express');
const router = express.Router();
const authenticate  = require('../middleware/auth');
const isAdmin       = require('../middleware/isAdmin');
const isVerified    = require('../middleware/isVerified');
const ctrl          = require('../controllers/pocController');

// Public metadata
router.get('/branches', ctrl.getBranches);

// Verified user: full-name exact search only
router.get('/search', authenticate, isVerified, ctrl.userSearch);

// Admin: alias-aware search + CRUD
router.get('/admin-search', authenticate, isAdmin, ctrl.adminSearch);
router.get('/',             authenticate, isAdmin, ctrl.getAll);
router.post('/',            authenticate, isAdmin, ctrl.addPOC);
router.put('/:id',authenticate, isAdmin, ctrl.updatePOC);
router.delete('/:id',       authenticate, isAdmin, ctrl.deletePOC);

module.exports = router;
