const { prisma } = require('../config/db');

const generateAcronyms = (name) => {
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) return [];
  return [words.map((w) => w[0]).join('').toLowerCase()];
};

// Map Prisma outputs to include MongoDB's _id structure for the frontend
const formatPOC = (poc) => {
  if (!poc) return null;
  const formatted = { ...poc, _id: poc.id };
  if (formatted.addedBy) {
    formatted.addedBy = { ...formatted.addedBy, _id: formatted.addedBy.id };
    formatted.userId = formatted.addedBy; // Backward compatibility for getAll
  }
  return formatted;
};

const searchByName = async (q) => {
  const normalize = (str = '') => str.toLowerCase().replace(/\s+/g, '').trim();
  const normalized = normalize(q);

  if (!normalized) return [];

  // 🚀 SQL OPTIMIZATION: Filter in the database, not in JavaScript
  const candidatePOCs = await prisma.$queryRaw`
    SELECT * FROM "POC"
    WHERE "nameLower" ILIKE ${'%' + normalized + '%'}
       OR EXISTS (SELECT 1 FROM unnest("aliases") AS a WHERE a ILIKE ${'%' + normalized + '%'})
       OR EXISTS (SELECT 1 FROM unnest("acronyms") AS a WHERE a ILIKE ${'%' + normalized + '%'})
  `;

  const scored = candidatePOCs
    .map((poc) => {
      const name = normalize(poc.nameLower || '');
      const aliases = (poc.aliases || []).map((a) => normalize(a));
      const acronyms = (poc.acronyms || []).map((a) => normalize(a));

      let score = 0;
      if (name === normalized) score = 120;
      else if (acronyms.includes(normalized)) score = 100;
      else if (acronyms.some((a) => a.includes(normalized))) score = 90;
      else if (aliases.includes(normalized)) score = 80;
      else if (aliases.some((a) => a.includes(normalized))) score = 70;
      else if (name.startsWith(normalized)) score = 60;
      else if (name.includes(normalized)) score = 50;

      return { name: poc.name, score };
    })
    .filter((poc) => poc.score > 0)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.name.localeCompare(b.name)))
    .slice(0, 3)
    .map((poc) => poc.name);

  return scored;
};

const adminSearch = async (query) => {
  const normalized = query.toLowerCase().replace(/\s+/g, '').trim();
  if (!normalized) return [];

  // 🚀 SQL OPTIMIZATION: Filter in the database, not in JavaScript
  const candidatePOCs = await prisma.$queryRaw`
    SELECT * FROM "POC"
    WHERE "nameLower" ILIKE ${'%' + normalized + '%'}
       OR EXISTS (SELECT 1 FROM unnest("aliases") AS a WHERE a ILIKE ${'%' + normalized + '%'})
       OR EXISTS (SELECT 1 FROM unnest("acronyms") AS a WHERE a ILIKE ${'%' + normalized + '%'})
  `;

  const scored = candidatePOCs
    .map((poc) => {
      const name = poc.nameLower || '';
      const compactName = name.replace(/\s+/g, '');
      const aliases = (poc.aliases || []).map((a) => a.toLowerCase().replace(/\s+/g, ''));
      const acronyms = (poc.acronyms || []).map((a) => a.toLowerCase().replace(/\s+/g, ''));

      let score = 0;
      const exactAcronym = acronyms.includes(normalized);
      const partialAcronym = acronyms.some((a) => a.includes(normalized));
      const exactAlias = aliases.includes(normalized);
      const partialAlias = aliases.some((a) => a.includes(normalized));
      const exactName = compactName === normalized;
      const startsWithName = compactName.startsWith(normalized);
      const partialName = compactName.startsWith(normalized);

      if (exactName) score = 120;
      else if (exactAcronym) score = 100;
      else if (exactAlias) score = 90;
      else if (startsWithName) score = 80;
      else if (partialAcronym) score = 70;
      else if (partialAlias) score = 50;
      else if (partialName) score = 40;

      return { ...formatPOC(poc), score };
    })
    .filter((poc) => poc.score > 0)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.name.localeCompare(b.name)))
    .slice(0, 5);

  return scored;
};

const getAllPOCs = async (branch, cursor = 0, limit = 20) => {
  let pocs;

  if (branch) {
    // 🚀 SQL OPTIMIZATION: Offset pagination for alphabetical lists
    pocs = await prisma.$queryRaw`
      SELECT 
        p.*, 
        json_build_object(
          '_id', u.id,
          'id', u.id,
          'clerkId', u."clerkId",
          'email', u.email,
          'firstName', u."firstName",
          'lastName', u."lastName"
        ) AS "addedBy"
      FROM "POC" p
      JOIN "User" u ON p."addedById" = u.id
      WHERE p.branch = ${branch}
      ORDER BY p."nameLower" ASC
      LIMIT ${limit} OFFSET ${cursor}
    `;

    const formattedData = pocs.map((poc) => ({
      ...poc,
      _id: poc.id,
      userId: poc.addedBy,
    }));

    // If we fetched the limit, there's likely a next page.
    // The next cursor is simply the current offset + limit
    const nextCursor = pocs.length === limit ? cursor + limit : null;

    return {
      data: formattedData,
      nextCursor,
    };

  } else {
    // PRESERVED: Your custom logic for global context counting
    pocs = await prisma.$queryRaw`
      SELECT branch
      FROM "POC"
      ORDER BY branch ASC
    `;
    return pocs.map((poc) => poc.branch);
  }
};

const addPOC = async ({ name, aliases, branch, addedBy }) => {
  const normalized = name.toLowerCase().trim();

  const existing = await prisma.pOC.findFirst({
    where: { nameLower: normalized },
  });

  if (existing) {
    throw new Error('A POC with this name already exists.');
  }

  const nameLower = normalized;
  const formattedAliases = (aliases || []).map((a) => a.toLowerCase().trim());
  const acronyms = generateAcronyms(name);

  const poc = await prisma.pOC.create({
    data: {
      name,
      nameLower,
      aliases: formattedAliases,
      acronyms,
      branch,
      addedById: addedBy,
    },
  });

  return formatPOC(poc);
};

const updatePOC = async (id, updates) => {
  const data = { ...updates };
  if (data.name) {
    data.nameLower = data.name.toLowerCase().trim();
    data.acronyms = generateAcronyms(data.name);
  }
  if (data.aliases) {
    data.aliases = data.aliases.map((a) => a.toLowerCase().trim());
  }

  try {
    const poc = await prisma.pOC.update({
      where: { id },
      data,
    });
    return formatPOC(poc);
  } catch (err) {
    if (err.code === 'P2025') throw new Error('POC not found.');
    throw err;
  }
};

const deletePOC = async (id) => {
  try {
    const poc = await prisma.pOC.delete({
      where: { id },
    });
    return formatPOC(poc);
  } catch (err) {
    if (err.code === 'P2025') throw new Error('POC not found.');
    throw err;
  }
};

module.exports = {
  searchByName,
  adminSearch,
  getAllPOCs,
  addPOC,
  updatePOC,
  deletePOC,
};