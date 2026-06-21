const pocService = require('../services/pocService');
const recentService = require('../services/recentService');
const { BRANCHES } = require('../utils/constants');
const { prisma } = require('../config/db');

const getBranches = (_req, res) => res.json(BRANCHES);

const getAll = async (req, res, next) => {
  try {
    const { branch, cursor = 0, limit = 20 } = req.query;
    const pocs = await pocService.getAllPOCs(
      branch, 
      parseInt(cursor, 10), 
      parseInt(limit, 10)
    );
    res.json(pocs);
  } catch (err) {
    next(err);
  }
};

const userSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query is required.' });
    }
    const scored = await pocService.searchByName(q);

    return res.json({
      found: scored.length > 0,
      results: scored,
    });
  } catch (err) {
    next(err);
  }
};

const adminSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    const results = await pocService.adminSearch(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

const addPOC = async (req, res, next) => {
  try {
    const { name, aliases, branch } = req.body;

    if (!name || !branch) {
      return res.status(400).json({ message: 'Name and branch are required.' });
    }

    const {userId} = req.auth();

    const clerkId = userId;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const poc = await pocService.addPOC({
      name,
      aliases,
      branch,
      addedBy: user.id, // passing the internal PostgreSQL id
    });

    await recentService.createRecent({
      POCId: poc.id,
      POCName: poc.name,
      POCBranch: poc.branch,
      actionType: 'Added',
      actionBy: user.id,
    });

    res.status(201).json(poc);
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
};

const updatePOC = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {userId} = req.auth();
    const clerkId = userId;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const getBranchFromEmail = (email = '') => {
      const match = email.toLowerCase().match(/ug([a-z]{2})/);
      if (!match) return null;

      const code = match[1];
      const BRANCH_MAPPINGS = {
        ec: 'ECE', ee: 'EE', cs: 'CSE', ce: 'CIVIL', cm: 'ECM',
        mm: 'MME', pi: 'PIE', me: 'MECH',
      };
      return BRANCH_MAPPINGS[code] || null;
    };

    const userBranch = getBranchFromEmail(user.email);
    const poc = await pocService.updatePOC(id, req.body);

    if (!userBranch) {
      return res.status(400).json({ message: 'Unable to determine user branch from email.' });
    }

    const isTransfer = poc.branch !== userBranch;

    if (isTransfer) {
      await recentService.createRecent({
        POCId: poc.id,
        POCName: poc.name,
        POCBranch: poc.branch,
        actionType: 'Transferred',
        actionBy: user.id,
      });
    } else {
      await recentService.upsertUpdatedRecent({
        POCId: poc.id,
        POCName: poc.name,
        POCBranch: poc.branch,
        actionBy: user.id,
      });
    }

    res.json(poc);
  } catch (err) {
    next(err);
  }
};

const deletePOC = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {userId} = req.auth();
    const clerkId = userId;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const poc = await prisma.pOC.findUnique({ where: { id } });
    if (!poc) {
      return res.status(404).json({ message: 'POC not found.' });
    }
    await recentService.createRecent({
      POCId: poc.id,
      POCName: poc.name,
      POCBranch: poc.branch,
      actionType: 'Deleted',
      actionBy: user.id,
    });

    await pocService.deletePOC(id);

    res.json({ message: 'POC removed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBranches,
  getAll,
  userSearch,
  adminSearch,
  addPOC,
  updatePOC,
  deletePOC,
};