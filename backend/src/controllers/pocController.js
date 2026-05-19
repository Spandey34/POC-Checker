const pocService = require('../services/pocService');
const recentService = require('../services/recentService');
const { BRANCHES, POC } = require('../models/POC');
const User = require('../models/User');

const getBranches = (_req, res) => res.json(BRANCHES);

const getAll = async (req, res, next) => {
  try {
    const { branch } = req.query;
    const pocs = await pocService.getAllPOCs(branch);
    res.json(pocs);
  } catch (err) {
    next(err);
  }
};

const userSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: 'Search query is required.',
      });
    }

    const result = await pocService.searchByName(q);

    if (!result) {
      return res.json({ found: false });
    }

    res.json({ found: true });
  } catch (err) {
    next(err);
  }
};

const adminSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: 'Search query is required.',
      });
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
      return res.status(400).json({
        message: 'Name and branch are required.',
      });
    }

    const clerkId = req.auth.userId;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const poc = await pocService.addPOC({
      name,
      aliases,
      branch,
      addedBy: user._id,
    });

    await recentService.createRecent({
      POCId: poc._id,
      POCName: poc.name,
      POCBranch: poc.branch,
      actionType: 'Added',
      actionBy: user._id,
    });

    res.status(201).json(poc);
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({
        message: err.message,
      });
    }

    next(err);
  }
};

const updatePOC = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const poc = await pocService.updatePOC(id, req.body);

    await recentService.upsertUpdatedRecent({
      POCId: poc._id,
      POCName: poc.name,
      POCBranch: poc.branch,
      actionBy: user._id,
    });

    res.json(poc);
  } catch (err) {
    next(err);
  }
};

const deletePOC = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const poc = await POC.findById(id);
    if (!poc) {
      return res.status(404).json({
        message: 'POC not found.',
      });
    }

    await recentService.createRecent({
      POCId: poc._id,
      POCName: poc.name,
      POCBranch: poc.branch,
      actionType: 'Deleted',
      actionBy: user._id,
    });

    await pocService.deletePOC(id);

    res.json({
      message: 'POC removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBranches,
  getAll,
  getRecentPOCs,
  userSearch,
  adminSearch,
  addPOC,
  updatePOC,
  deletePOC,
};