const recentService = require('../services/recentService');

const getRecentActivities = async (
  req,
  res,
  next
) => {
  try {
    const recent =
      await recentService.getRecentActivities();

    res.json(recent);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecentActivities,
};