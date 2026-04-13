const Review = require('../models/Review');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// @desc    Get reviews for an event
// @route   GET /api/events/:eventId/reviews
// @access  Public
exports.getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Get reviews with pagination
    const reviews = await Review.find({ eventId })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('userId userName rating comment createdAt');

    // Get total count
    const total = await Review.countDocuments({ eventId });

    // Get average rating stats
    const stats = await Review.getAverageRating(eventId);

    res.status(200).json({
      success: true,
      data: reviews,
      stats: {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// @desc    Submit a review for an event
// @route   POST /api/events/:eventId/reviews
// @access  Private
exports.submitReview = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    // Validate input
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user has purchased a ticket for this event
    const hasTicket = await Ticket.findOne({
      eventId,
      userId,
    });

    if (!hasTicket) {
      return res.status(403).json({
        success: false,
        message: 'You must have purchased a ticket to review this event',
      });
    }

    // Check if user has already reviewed
    const existingReview = await Review.findOne({ eventId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this event',
      });
    }

    // Create review
    const review = await Review.create({
      eventId,
      userId,
      userName,
      rating,
      comment: comment.trim(),
    });

    // Get updated stats
    const stats = await Review.getAverageRating(eventId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
      stats,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    
    // Handle duplicate review error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this event',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews',
      });
    }

    // Update review
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }
      review.rating = rating;
    }

    if (comment) {
      review.comment = comment.trim();
    }

    await review.save();

    // Get updated stats
    const stats = await Review.getAverageRating(review.eventId);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
      stats,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message,
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns this review or is admin
    if (review.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews',
      });
    }

    const eventId = review.eventId;
    await review.deleteOne();

    // Get updated stats
    const stats = await Review.getAverageRating(eventId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      stats,
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};
