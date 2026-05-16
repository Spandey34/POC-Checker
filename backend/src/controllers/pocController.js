const pocService = require('../services/pocService');
const { BRANCHES } = require('../models/POC');

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

/**
 * Normal user search — exact company name, no aliases.
 */
const userSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ message: 'Search query is required.' });

    const result = await pocService.searchByName(q);
    if (!result) return res.json({ found: false });

    res.json({ found: true, poc: result });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin search — name OR aliases, partial match.
 */
const adminSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ message: 'Search query is required.' });

    const results = await pocService.adminSearch(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

const addPOC = async (req, res, next) => {
  try {
    const { name, aliases, branches } = req.body;
    if (!name || !branches || branches.length === 0) {
      return res.status(400).json({ message: 'Name and at least one branch are required.' });
    }
    const poc = await pocService.addPOC({ name, aliases, branches, addedBy: req.auth.userId });
    res.status(201).json(poc);
  } catch (err) {
    if (err.message.includes('already exists')) return res.status(409).json({ message: err.message });
    next(err);
  }
};

const updatePOC = async (req, res, next) => {
  try {
    const poc = await pocService.updatePOC(req.params.id, req.body);
    res.json(poc);
  } catch (err) {
    next(err);
  }
};

const deletePOC = async (req, res, next) => {
  try {
    await pocService.deletePOC(req.params.id);
    res.json({ message: 'POC removed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBranches, getAll, userSearch, adminSearch, addPOC, updatePOC, deletePOC };
