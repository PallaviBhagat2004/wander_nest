const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Listing = require('../models/Listing');

/** GET /api/listings/:listingId/reviews */
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ listing: req.params.listingId })
    .populate('author', 'username')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

/** POST /api/listings/:listingId/reviews  (auth required) */
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    res.status(400);
    throw new Error('Rating and comment are required');
  }

  const listing = await Listing.findById(req.params.listingId);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  const review = await Review.create({
    listing: req.params.listingId,
    author: req.user._id,
    rating: Number(rating),
    comment,
  });

  const populated = await review.populate('author', 'username');
  res.status(201).json(populated);
});

/** DELETE /api/listings/:listingId/reviews/:reviewId  (author only) */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (review.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not the author');
  }
  await review.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = { getReviews, createReview, deleteReview };
