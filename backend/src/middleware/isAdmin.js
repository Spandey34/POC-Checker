/**
 * Must be used AFTER authenticate middleware.
 * Ensures the requesting user is an admin.
 */
const isAdmin = (req, res, next) => {
  if (req.dbUser?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = isAdmin;
