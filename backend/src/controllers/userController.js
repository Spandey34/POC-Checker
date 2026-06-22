const userService = require('../services/userService');

const getMe = async (req, res, next) => {
  try {
    const {userId} = req.auth();
    const user = await userService.getMe(userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { cursor, limit = 20 } = req.query;
    
    // Pass the cursor and parsed limit to the service
    const userData = await userService.getAllUsers(
      req.dbUser.email, 
      cursor, 
      parseInt(limit, 10)
    );
    
    res.json(userData);
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

const deleteUser = async(req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.json(result);
  }
  catch (err) {
    next(err);
  }
}

module.exports = { getMe, getAllUsers, toggleVerification, deleteUser };
