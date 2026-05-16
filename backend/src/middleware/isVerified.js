/**
 * Must be used AFTER authenticate middleware.
 * Ensures the user account has been verified by admin.
 */
const isVerified = (req, res, next) => {
  if (!req.dbUser?.isVerified) {
    return res.status(403).json({ message: 'Account not verified. Please wait for admin approval.' });
  }
  next();
};

module.exports = isVerified;
