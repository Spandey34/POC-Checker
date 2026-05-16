const User = require('../models/User');

const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || 'nitjsr.ac.in';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

const isAllowedEmail = (email) => email.endsWith(`@${ALLOWED_DOMAIN}`);

/**
 * Create or update a user from Clerk webhook data.
 */
const upsertUserFromClerk = async ({ clerkId, email, firstName, lastName }) => {
  if (!isAllowedEmail(email)) {
    throw new Error(`Only @${ALLOWED_DOMAIN} emails are allowed.`);
  }

  const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      clerkId,
      email: email.toLowerCase(),
      firstName,
      lastName,
      ...(isAdmin ? { role: 'admin', isVerified: true } : {}),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return user;
};

const getAllUsers = async () =>
  User.find({ role: 'user' }).sort({ createdAt: -1 }).lean();

const toggleVerification = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.role === 'admin') throw new Error('Cannot modify admin status');

  user.isVerified = !user.isVerified;
  await user.save();
  return user;
};

const getMe = async (clerkId) => User.findOne({ clerkId }).lean();

module.exports = { upsertUserFromClerk, getAllUsers, toggleVerification, getMe, isAllowedEmail };
