const POC =
  require('../models/POC');

const mongoose =
  require('mongoose');


const searchByName = async (
  query
) => {
  const normalized =
    query
      .replace(/\s+/g, '')
      .toLowerCase()
      .trim();

  const result =
    await POC.aggregate([
      {
        $addFields: {
          compactName: {
            $replaceAll: {
              input:
                '$nameLower',
              find: ' ',
              replacement:
                '',
            },
          },
        },
      },

      {
        $match: {
          compactName:
            normalized,
        },
      },

      {
        $limit: 1,
      },
    ]);

  return result[0] || null;
};

const adminSearch = async (
  query
) => {
  const normalized =
    query
      .toLowerCase()
      .replace(/\s+/g, '')
      .trim();

  if (!normalized) {
    return [];
  }

  const allPOCs =
    await POC.find({}).lean();

  const scored =
    allPOCs
      .map((poc) => {
        const name =
          poc.nameLower || '';

        const compactName =
          name.replace(
            /\s+/g,
            ''
          );

        const aliases =
          (poc.aliases || []).map(
            (a) =>
              a
                .toLowerCase()
                .replace(
                  /\s+/g,
                  ''
                )
          );

        const acronyms =
          (
            poc.acronyms ||
            []
          ).map((a) =>
            a
              .toLowerCase()
              .replace(
                /\s+/g,
                ''
              )
          );

        let score = 0;

        const exactAcronym =
          acronyms.includes(
            normalized
          );

        const partialAcronym =
          acronyms.some((a) =>
            a.includes(
              normalized
            )
          );

        const exactAlias =
          aliases.includes(
            normalized
          );

        const partialAlias =
          aliases.some((a) =>
            a.includes(
              normalized
            )
          );

        const exactName =
          compactName ===
          normalized;

        const startsWithName =
          compactName.startsWith(
            normalized
          );

        const partialName =
          compactName.startsWith(
            normalized
          );

        if (exactAcronym) {
          score = 100;
        } else if (
          partialAcronym
        ) {
          score = 90;
        } else if (
          exactAlias
        ) {
          score = 80;
        } else if (
          partialAlias
        ) {
          score = 70;
        } else if (
          exactName
        ) {
          score = 60;
        } else if (
          startsWithName
        ) {
          score = 50;
        } else if (
          partialName
        ) {
          score = 40;
        }

        return {
          ...poc,
          score,
        };
      })
      .filter(
        (poc) => poc.score > 0
      )
      .sort((a, b) => {
        if (
          b.score !== a.score
        ) {
          return (
            b.score - a.score
          );
        }

        return a.name.localeCompare(
          b.name
        );
      });

  return scored;
};

const getAllPOCs = async (
  branch
) => {
  const filter =
    branch
      ? { branch }
      : {};

  const pocs = await POC.find(
    filter
  )
    .populate(
      'addedBy',
      'clerkId email phoneNumber firstName lastName'
    )
    .sort({ name: 1 })
    .lean();

  return pocs.map((poc) => ({
    ...poc,
    userId: poc.addedBy,
  }));
};

const getRecentPOCs =
  async () => {
    const excludedUserId =
      new mongoose.Types.ObjectId(
        '6a088185d5fd8db9c21499a3'
      );

    const pocs =
      await POC.find({
        addedBy: {
          $ne: excludedUserId,
        },
      })
        .populate(
          'addedBy',
          'clerkId email phoneNumber firstName lastName'
        )
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean();

    return pocs.map((poc) => ({
      ...poc,
      userId: poc.addedBy,
    }));
  };

const addPOC = async ({
  name,
  aliases,
  branch,
  addedBy,
}) => {
  const normalized =
    name
      .toLowerCase()
      .trim();

  const existing =
    await POC.findOne({
      nameLower:
        normalized,
    });

  if (existing) {
    throw new Error(
      'A POC with this name already exists.'
    );
  }

  const poc =
    new POC({
      name,

      aliases:
        aliases || [],

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
    await POC.findByIdAndDelete(
      id
    );

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
  getRecentPOCs,
  addPOC,
  updatePOC,
  deletePOC,
};