const { prisma } = require('../config/db');
const { clerkClient } = require('@clerk/express');

const authenticate = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      return res.status(400).json({ message: 'Email not found for Clerk user.' });
    }

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        lastVisit: new Date(),
      },
      create: {
        clerkId: userId,
        email: email.toLowerCase(),
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        lastVisit: new Date(),
      },
    });

    req.dbUser = { ...user, _id: user.id };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;