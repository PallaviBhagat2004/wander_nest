const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
    },
    amenities: { type: [String], default: [] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text', location: 'text', country: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
