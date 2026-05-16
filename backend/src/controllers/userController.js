const userService = require('../services/userService');

const getMe = async (req, res, next) => {
  try {
    const user = await userService.getMe(req.auth.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const toggleVerification = async (req, res, next) => {
  try {
    const user = await userService.toggleVerification(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, getAllUsers, toggleVerification };
