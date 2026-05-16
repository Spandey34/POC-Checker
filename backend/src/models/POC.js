const mongoose = require('mongoose');

const BRANCHES = [
  'CSE',
  'ECE',
  'MME',
  'ECM',
  'PIE',
  'Mech',
  'Civil',
];

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

  this.aliases = this.aliases.map(
    (a) => a.toLowerCase().trim()
  );

  next();
});

POCSchema.pre(
  'findOneAndUpdate',
  function (next) {
    const update = this.getUpdate();

    if (update.name) {
      update.nameLower =
        update.name
          .toLowerCase()
          .trim();
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
  mongoose.model('POC', POCSchema);

module.exports.BRANCHES =
  BRANCHES;