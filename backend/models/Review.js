const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate reviews from same user for same event
reviewSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Index for sorting by date
reviewSchema.index({ createdAt: -1 });

// Static method to get average rating for an event
reviewSchema.statics.getAverageRating = async function (eventId) {
  const stats = await this.aggregate([
    {
      $match: { eventId: new mongoose.Types.ObjectId(eventId) },
    },
    {
      $group: {
        _id: '$eventId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }

  return {
    averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: stats[0].totalReviews,
  };
};

// Static method to check if user has already reviewed an event
reviewSchema.statics.hasUserReviewed = async function (eventId, userId) {
  const review = await this.findOne({ eventId, userId });
  return !!review;
};

module.exports = mongoose.model('Review', reviewSchema);
