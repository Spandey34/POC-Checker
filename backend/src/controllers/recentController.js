const recentService = require('../services/recentService');

const getRecentActivities = async (req, res, next) => {
  try {
    const { cursor, limit = 20 } = req.query;
    
    // Parse limit to integer to ensure SQL safety
    const recentData = await recentService.getRecentActivities(cursor, parseInt(limit, 10));

    res.json(recentData);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecentActivities,
};