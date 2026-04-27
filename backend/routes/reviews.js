const express = require('express');
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// mergeParams lets us read :listingId from the parent route
const router = express.Router({ mergeParams: true });

router.get('/', getReviews);
router.post('/', protect, createReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
