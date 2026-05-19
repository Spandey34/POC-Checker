const Recent = require('../models/Recent');

const getRecentActivities =
  async () => {
    return Recent.find()
      .populate(
        'actionBy',
        'firstName lastName email'
      )
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  };

const createRecent = async ({
  POCId,
  POCName,
  POCBranch,
  actionType,
  actionBy,
}) => {
  return Recent.create({
    POCId,
    POCName,
    POCBranch,
    actionType,
    actionBy,
  });
};

const upsertUpdatedRecent = async ({
  POCId,
  POCName,
  POCBranch,
  actionBy,
}) => {
  return Recent.findOneAndUpdate(
    { POCId, actionType: 'Updated' },
    {
      $set: {
        POCName,
        POCBranch,
        actionBy,
        actionType: 'Updated',
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};


module.exports = {
  getRecentActivities,
    createRecent,
    upsertUpdatedRecent,
};