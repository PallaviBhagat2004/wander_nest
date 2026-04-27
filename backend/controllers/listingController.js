const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const Review = require('../models/Review');

const getListings = asyncHandler(async (req, res) => {
  const { q, location, country, minPrice, maxPrice } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (location) filter.location = new RegExp(location, 'i');
  if (country) filter.country = new RegExp(country, 'i');
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  const listings = await Listing.find(filter).sort({ createdAt: -1 });
  res.json(listings);
});

const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('owner', 'username');
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  const reviews = await Review.find({ listing: listing._id })
    .populate('author', 'username')
    .sort({ createdAt: -1 });
  const avgRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  res.json({
    ...listing.toObject(),
    reviews,
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
  });
});

const createListing = asyncHandler(async (req, res) => {
  const data = { ...req.body, owner: req.user?._id };
  const listing = await Listing.create(data);
  res.status(201).json(listing);
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (listing.owner && listing.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not the owner');
  }
  Object.assign(listing, req.body);
  await listing.save();
  res.json(listing);
});

const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (listing.owner && listing.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not the owner');
  }
  await listing.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = { getListings, getListing, createListing, updateListing, deleteListing };
