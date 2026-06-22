const { prisma } = require('../config/db');

const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || 'nitjsr.ac.in';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

const isAllowedEmail = (email) => email.endsWith(`@${ALLOWED_DOMAIN}`);

const getBranchFromEmail = (email) => {
  if (!email) return null;
  const match = email.toLowerCase().match(/ug([a-z]{2})/);
  return match ? match[1] : null;
};

// Helper to add frontend-required fields
const formatUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    _id: user.id,
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  };
};

const upsertUserFromClerk = async ({ clerkId, email, firstName, lastName }) => {
  if (!isAllowedEmail(email)) {
    throw new Error(`Only @${ALLOWED_DOMAIN} emails are allowed.`);
  }

  const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const lowerEmail = email.toLowerCase();

  // Single reads/writes stay as standard Prisma 
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {
      email: lowerEmail,
      firstName,
      lastName,
      ...(isAdmin ? { role: 'admin', isVerified: true } : {}),
    },
    create: {
      clerkId,
      email: lowerEmail,
      firstName,
      lastName,
      ...(isAdmin ? { role: 'admin', isVerified: true } : {}),
    },
  });

  return formatUser(user);
};

const getAllUsers = async (adminEmail, cursor, limit = 20) => {
  const adminBranch = getBranchFromEmail(adminEmail);

  if (!adminBranch) {
    throw new Error('Unable to detect branch from admin email.');
  }

  const regexPattern = `^\\d{4}ug${adminBranch}`;
  let users;

  if (cursor) {
    const cursorDate = new Date(cursor);
    users = await prisma.$queryRaw`
      SELECT * FROM "User"
      WHERE role = 'user'
        AND email ~* ${regexPattern}
        AND "createdAt" < ${cursorDate}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
  } else {
    users = await prisma.$queryRaw`
      SELECT * FROM "User"
      WHERE role = 'user'
        AND email ~* ${regexPattern}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
  }

  const formattedData = users.map(formatUser);

  // Determine the next cursor
  const nextCursor = formattedData.length === limit 
    ? formattedData[formattedData.length - 1].createdAt 
    : null;

  // Return the paginated structure
  return {
    data: formattedData,
    nextCursor,
  };
};

const toggleVerification = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.role === 'admin') throw new Error('Cannot modify admin status');

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isVerified: !user.isVerified },
  });

  return formatUser(updatedUser);
};

const getMe = async (clerkId) => {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  return formatUser(user);
};

const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.role === 'admin') throw new Error('Cannot delete admin user');

  await prisma.user.delete({ where: { id: userId } });
  return { message: 'User deleted successfully' };
}

module.exports = { 
  upsertUserFromClerk, 
  getAllUsers, 
  toggleVerification, 
  getMe, 
  isAllowedEmail,
  deleteUser,
};