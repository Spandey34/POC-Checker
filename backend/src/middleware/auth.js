const { requireAuth } = require('@clerk/express');
const User = require('../models/User');

/**
 * Step 1: Verify Clerk JWT.
 * Step 2: Attach MongoDB user to req.dbUser and update lastVisit.
 */
const authenticate = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const { userId } = req.auth();
      const clerkId = userId;
      const user = await User.findOneAndUpdate(
        { clerkId },
        { lastVisit: new Date() },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found in database. Please contact admin.' });
      }
      

      req.dbUser = user;
      next();
    } catch (err) {
      next(err);
    }
  },
];

module.exports = authenticate;
