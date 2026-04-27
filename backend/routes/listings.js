const express = require('express');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const reviewRoutes = require('./reviews');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Nested reviews router: /api/listings/:listingId/reviews
router.use('/:listingId/reviews', reviewRoutes);

router.get('/', getListings);
router.get('/:id', getListing);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
