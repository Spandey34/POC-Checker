const { prisma } = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const {userId} = req.auth();

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const user = await prisma.user.update({
        where: { clerkId: userId },
        data: { lastVisit: new Date() },
      });

      // Maintain MongoDB _id standard for frontend compatibility
      req.dbUser = { ...user, _id: user.id };
      next();
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ message: 'User not found in database.' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;