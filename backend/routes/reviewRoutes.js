const express = require('express');
const router = express.Router();
const {
  getEventReviews,
  submitReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { authenticate } = require('../middleware');

// Event reviews routes
router.get('/events/:eventId/reviews', getEventReviews); // Public - get reviews for an event
router.post('/events/:eventId/reviews', authenticate, submitReview); // Protected - submit a review

// Individual review routes
router.put('/reviews/:reviewId', authenticate, updateReview); // Protected - update own review
router.delete('/reviews/:reviewId', authenticate, deleteReview); // Protected - delete own review

module.exports = router;
