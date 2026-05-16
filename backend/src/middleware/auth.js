const User =
  require('../models/User');

const authenticate =
  async (
    req,
    res,
    next
  ) => {
    try {
      const userId =
        req.auth?.userId;

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              'Unauthorized',
          });
      }

      const user =
        await User.findOneAndUpdate(
          {
            clerkId:
              userId,
          },
          {
            lastVisit:
              new Date(),
          },
          {
            new: true,
          }
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              'User not found in database.',
          });
      }

      req.dbUser = user;

      next();
    } catch (err) {
      next(err);
    }
  };

module.exports =
  authenticate;