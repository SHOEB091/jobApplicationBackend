const mongoose = require('mongoose');

const adminRequestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Company',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const AdminRequest = mongoose.model('AdminRequest', adminRequestSchema);

module.exports = AdminRequest;
