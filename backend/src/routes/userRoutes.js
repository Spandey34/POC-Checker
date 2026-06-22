const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { getMe, getAllUsers, toggleVerification, deleteUser } = require('../controllers/userController');

// Any logged-in user can fetch their own profile
router.get('/me', authenticate, getMe);

// Admin only
router.get('/',authenticate, isAdmin, getAllUsers);
router.patch('/:id/toggle-verify', authenticate, isAdmin, toggleVerification);
router.delete('/:id', authenticate, isAdmin, deleteUser);

module.exports = router;
