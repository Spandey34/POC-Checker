const mongoose = require('mongoose');

const BRANCHES = [
  'CSE',
  'EE',
  'ECE',
  'MME',
  'ECM',
  'PIE',
  'MECH',
  'CIVIL',
];

const generateAcronyms = (name) => {
  const words = name
    .trim()
    .split(/\s+/);

  if (words.length <= 1) {
    return [];
  }

  return [
    words
      .map((w) => w[0])
      .join('')
      .toLowerCase(),
  ];
};

const POCSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    nameLower: {
      type: String,
      index: true,
    },

    aliases: {
      type: [String],
      default: [],
    },

    acronyms: {
      type: [String],
      default: [],
      index: true,
    },

    branch: {
      type: String,
      enum: BRANCHES,
      required: true,
    },

    addedBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

POCSchema.pre('save', function (next) {
  this.nameLower =
    this.name.toLowerCase().trim();

  this.aliases =
    this.aliases.map((a) =>
      a.toLowerCase().trim()
    );

  this.acronyms =
    generateAcronyms(this.name);

  next();
});

POCSchema.pre(
  'findOneAndUpdate',
  function (next) {
    const update =
      this.getUpdate();

    if (update.name) {
      update.nameLower =
        update.name
          .toLowerCase()
          .trim();

      update.acronyms =
        generateAcronyms(
          update.name
        );
    }

    if (update.aliases) {
      update.aliases =
        update.aliases.map((a) =>
          a.toLowerCase().trim()
        );
    }

    next();
  }
);

module.exports =
  mongoose.model(
    'POC',
    POCSchema
  );

module.exports.BRANCHES =
  BRANCHES;