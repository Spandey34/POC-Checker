const mongoose = require('mongoose');
import { BRANCHES } from './POC';

const RecentSchema = new mongoose.Schema(
  {
    POCName: {
      type: String,
      required: true,
    },
    POCId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'POC',
      required: true,
    },
    POCBranch: {
      type: String,
      enum: BRANCHES,
      required: true,
    },
    actionType: {
      type: String,
      enum: ['Added', 'Deleted', 'Updated', 'Transferred'],
      required: true,
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto delete after 30 days from last update
RecentSchema.index(
  { updatedAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

module.exports = mongoose.model('Recent', RecentSchema);