const POC = require('../models/POC');

const searchByName = async (
  query
) => {
  const normalized = query
    .toLowerCase()
    .trim();

  const result =
    await POC.findOne({
      nameLower: normalized,
    }).lean();

  return result;
};

const adminSearch = async (
  query
) => {
  const normalized = query
    .toLowerCase()
    .trim();

  const results =
    await POC.find({
      $or: [
        {
          nameLower: {
            $regex: normalized,
            $options: 'i',
          },
        },

        {
          aliases: {
            $elemMatch: {
              $regex: normalized,
              $options: 'i',
            },
          },
        },
      ],
    })
      .sort({ name: 1 })
      .lean();

  return results;
};

const getAllPOCs = async (
  branch
) => {
  const filter = branch
    ? { branch }
    : {};

  return POC.find(filter)
    .sort({ name: 1 })
    .lean();
};

const addPOC = async ({
  name,
  aliases,
  branch,
  addedBy,
}) => {
  const existing =
    await POC.findOne({
      nameLower: name
        .toLowerCase()
        .trim(),
    });

  if (existing) {
    throw new Error(
      'A POC with this name already exists.'
    );
  }

  const poc = new POC({
    name,
    aliases: aliases || [],
    branch,
    addedBy,
  });

  await poc.save();

  return poc;
};

const updatePOC = async (
  id,
  updates
) => {
  const poc =
    await POC.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

  if (!poc) {
    throw new Error(
      'POC not found.'
    );
  }

  return poc;
};

const deletePOC = async (
  id
) => {
  const poc =
    await POC.findByIdAndDelete(id);

  if (!poc) {
    throw new Error(
      'POC not found.'
    );
  }

  return poc;
};

module.exports = {
  searchByName,
  adminSearch,
  getAllPOCs,
  addPOC,
  updatePOC,
  deletePOC,
};