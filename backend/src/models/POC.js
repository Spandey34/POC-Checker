const mongoose = require('mongoose');

const BRANCHES = ['CSE', 'ECE', 'MME', 'ECM', 'PIE', 'Mech', 'Civil'];

const POCSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Normalized lowercase name for fast exact-match queries by users
    nameLower: {
      type: String,
      index: true,
    },
    // Admin-only: aliases / shortcuts (e.g. "mmt", "make my trip")
    aliases: {
      type: [String],
      default: [],
    },
    branches: {
      type: [{ type: String, enum: BRANCHES }],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one branch is required.',
      },
    },
    addedBy: {
      type: String, // Clerk ID of admin
      required: true,
    },
  },
  { timestamps: true }
);

// Keep nameLower in sync automatically
POCSchema.pre('save', function (next) {
  this.nameLower = this.name.toLowerCase().trim();
  this.aliases = this.aliases.map((a) => a.toLowerCase().trim());
  next();
});

POCSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.nameLower = update.name.toLowerCase().trim();
  }
  if (update.aliases) {
    update.aliases = update.aliases.map((a) => a.toLowerCase().trim());
  }
  next();
});

module.exports = mongoose.model('POC', POCSchema);
module.exports.BRANCHES = BRANCHES;
