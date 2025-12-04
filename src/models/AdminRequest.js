const mongoose = require('mongoose');

const adminRequestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Company Verification Details
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    gstNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    companyAddress: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      required: true,
      enum: ['IT', 'Manufacturing', 'Services', 'Retail', 'Healthcare', 'Education', 'Finance', 'Other'],
    },
    description: {
      type: String,
    },
    // Request Status
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
    reviewMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
adminRequestSchema.index({ user: 1, status: 1 });
adminRequestSchema.index({ status: 1, createdAt: -1 });

const AdminRequest = mongoose.model('AdminRequest', adminRequestSchema);

module.exports = AdminRequest;
