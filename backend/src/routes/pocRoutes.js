const express = require('express');

const router = express.Router();

const authenticate =
  require('../middleware/auth');

const isAdmin =
  require('../middleware/isAdmin');

const isVerified =
  require('../middleware/isVerified');

const ctrl =
  require('../controllers/pocController');


// ─────────────────────────────────────
// Public metadata
// ─────────────────────────────────────
router.get(
  '/branches',
  ctrl.getBranches
);


// ─────────────────────────────────────
// Verified user routes
// ─────────────────────────────────────

// Full-name exact search only
router.get(
  '/search',
  authenticate,
  isVerified,
  ctrl.userSearch
);


// ─────────────────────────────────────
// Admin routes
// ─────────────────────────────────────

// Alias-aware admin search
router.get(
  '/admin-search',
  authenticate,
  isAdmin,
  ctrl.adminSearch
);


// Recently added POCs


// Get all POCs
router.get(
  '/',
  authenticate,
  isAdmin,
  ctrl.getAll
);


// Add POC
router.post(
  '/',
  authenticate,
  isAdmin,
  ctrl.addPOC
);


// Update POC
router.put(
  '/:id',
  authenticate,
  isAdmin,
  ctrl.updatePOC
);


// Delete POC
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  ctrl.deletePOC
);

module.exports = router;