const { prisma } = require('../config/db');

const formatRecent = (recent) => {
  if (!recent) return null;
  const formatted = { ...recent, _id: recent.id };
  if (formatted.actionBy) {
    formatted.actionBy = { ...formatted.actionBy, _id: formatted.actionBy.id };
  }
  return formatted;
};

const getRecentActivities = async (cursor, limit = 20) => {
  let recents;

  if (cursor) {
    // If a cursor is provided, fetch items OLDER than the cursor
    const cursorDate = new Date(cursor);
    recents = await prisma.$queryRaw`
      SELECT 
        r.*, 
        json_build_object(
          '_id', u.id,
          'id', u.id,
          'email', u.email,
          'firstName', u."firstName",
          'lastName', u."lastName"
        ) AS "actionBy"
      FROM "Recent" r
      JOIN "User" u ON r."actionById" = u.id
      WHERE r."createdAt" < ${cursorDate}
      ORDER BY r."createdAt" DESC
      LIMIT ${limit}
    `;
  } else {
    // Initial load: Fetch the absolute latest items
    recents = await prisma.$queryRaw`
      SELECT 
        r.*, 
        json_build_object(
          '_id', u.id,
          'id', u.id,
          'email', u.email,
          'firstName', u."firstName",
          'lastName', u."lastName"
        ) AS "actionBy"
      FROM "Recent" r
      JOIN "User" u ON r."actionById" = u.id
      ORDER BY r."createdAt" DESC
      LIMIT ${limit}
    `;
  }

  // Format the data mapping for the frontend
  const formattedData = recents.map((recent) => ({
    ...recent,
    _id: recent.id,
  }));

  // Determine the next cursor:
  // If we got back exactly the limit amount, there might be more data.
  // The cursor is the timestamp of the very last item in this batch.
  const nextCursor = formattedData.length === limit 
    ? formattedData[formattedData.length - 1].createdAt 
    : null;

  // Return the new structure
  return {
    data: formattedData,
    nextCursor,
  };
};

const createRecent = async ({ POCId, POCName, POCBranch, actionType, actionBy }) => {
  const recent = await prisma.recent.create({
    data: {
      POCId,
      POCName,
      POCBranch,
      actionType,
      actionById: actionBy, 
    },
  });
  return formatRecent(recent);
};

const upsertUpdatedRecent = async ({ POCId, POCName, POCBranch, actionBy }) => {
  const existing = await prisma.recent.findFirst({
    where: { POCId, actionType: 'Updated' },
  });

  let recent;
  if (existing) {
    recent = await prisma.recent.update({
      where: { id: existing.id },
      data: { POCName, POCBranch, actionById: actionBy, actionType: 'Updated' },
    });
  } else {
    recent = await prisma.recent.create({
      data: { POCId, POCName, POCBranch, actionById: actionBy, actionType: 'Updated' },
    });
  }

  return formatRecent(recent);
};

module.exports = {
  getRecentActivities,
  createRecent,
  upsertUpdatedRecent,
};