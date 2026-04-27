require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Review = require('../models/Review');

const sampleListings = [
  {
    title: 'Cozy Beachside Cottage',
    description: 'Steps from the sand. Wake up to the sound of waves and a fresh sea breeze. Ideal for couples and solo travelers seeking calm.',
    location: 'Goa', country: 'India', price: 2500,
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200',
    amenities: ['wifi', 'kitchen', 'ac', 'beach access'],
  },
  {
    title: 'Modern Downtown Loft',
    description: 'Stylish loft in the heart of the city. Walking distance to cafes, museums, and nightlife. Fast wifi for digital nomads.',
    location: 'Mumbai', country: 'India', price: 4200,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    amenities: ['wifi', 'ac', 'kitchen', 'parking', 'workspace'],
  },
  {
    title: 'Mountain View Cabin',
    description: 'Wooden cabin with panoramic Himalayan views. Cozy fireplace, hot tea, and silence. Perfect for a winter retreat.',
    location: 'Manali', country: 'India', price: 3500,
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
    amenities: ['wifi', 'fireplace', 'mountain view', 'parking'],
  },
  {
    title: 'Luxury Pool Villa',
    description: 'Private villa with infinity pool, chef on request, and lush garden. Five-star hospitality for an unforgettable getaway.',
    location: 'Udaipur', country: 'India', price: 12000,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
    amenities: ['wifi', 'pool', 'ac', 'kitchen', 'parking', 'breakfast'],
  },
  {
    title: 'Backpackers Hostel Bunk',
    description: 'Affordable, clean, and social. Meet fellow travelers in our common lounge and join nightly walking tours of the old city.',
    location: 'Jaipur', country: 'India', price: 800,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200',
    amenities: ['wifi', 'shared kitchen', 'lockers'],
  },
  {
    title: 'Lakeside Wooden House',
    description: 'Traditional wooden house overlooking a peaceful lake. Boating, birdwatching, and slow mornings with chai.',
    location: 'Srinagar', country: 'India', price: 4800,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
    amenities: ['wifi', 'lake view', 'breakfast', 'heater'],
  },
  {
    title: 'Tropical Treehouse',
    description: 'Sleep among the palm trees. Eco-friendly design with open-air shower and hammock deck. Wildlife at your doorstep.',
    location: 'Wayanad', country: 'India', price: 3000,
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200',
    amenities: ['wifi', 'outdoor shower', 'breakfast'],
  },
  {
    title: 'Desert Camp Tent',
    description: 'Glamping under the stars in the Thar desert. Camel rides, folk music around the bonfire, and warm Rajasthani thali.',
    location: 'Jaisalmer', country: 'India', price: 2800,
    image: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=1200',
    amenities: ['breakfast', 'bonfire', 'camel ride'],
  },
  {
    title: 'Heritage Haveli Suite',
    description: 'Sleep in a 200-year-old haveli with frescoed ceilings and a quiet inner courtyard. Old-world Rajasthan charm in every corner.',
    location: 'Jodhpur', country: 'India', price: 5400,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
    amenities: ['wifi', 'ac', 'breakfast', 'rooftop view'],
  },
  {
    title: 'Backwater Houseboat',
    description: 'Drift through palm-fringed canals on a private houseboat. Onboard chef serves fresh Kerala curries while you watch the sunset.',
    location: 'Alleppey', country: 'India', price: 6200,
    image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200',
    amenities: ['ac', 'all meals', 'private deck', 'crew'],
  },
  {
    title: 'Hilltop Tea Estate Bungalow',
    description: 'Colonial-era planter bungalow surrounded by emerald tea fields. Misty mornings, log fire evenings, and home-cooked Tamil food.',
    location: 'Munnar', country: 'India', price: 4600,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    amenities: ['wifi', 'fireplace', 'breakfast', 'mountain view'],
  },
  {
    title: 'Studio near Charminar',
    description: 'Compact, well-lit studio just 5 minutes from Charminar. Perfect base for biryani hunters and history buffs.',
    location: 'Hyderabad', country: 'India', price: 1800,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    amenities: ['wifi', 'ac', 'kitchenette'],
  },
  {
    title: 'Riverside Glamping Dome',
    description: 'Geodesic dome with skylight beside a quiet river. Stargaze from bed, kayak in the morning, and grill dinner on the deck.',
    location: 'Rishikesh', country: 'India', price: 3900,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
    amenities: ['wifi', 'river view', 'kayak', 'bbq'],
  },
  {
    title: 'Old Quarter Apartment',
    description: 'Charming 1-BHK in a heritage neighborhood with cafes, bakeries, and a leafy walking street right outside the door.',
    location: 'Pondicherry', country: 'India', price: 3200,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
    amenities: ['wifi', 'ac', 'kitchen', 'workspace'],
  },
  {
    title: 'Ski-in Chalet',
    description: 'Wood-clad chalet steps from the gondola. Heated boot room, fluffy duvets, and a hot chocolate bar to end the day.',
    location: 'Gulmarg', country: 'India', price: 8800,
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1200',
    amenities: ['wifi', 'fireplace', 'heater', 'ski storage', 'breakfast'],
  },
  {
    title: 'Beachfront Penthouse',
    description: 'Top-floor penthouse with private terrace, plunge pool, and 180° ocean views. Wake up, walk five steps, jump in the sea.',
    location: 'Varkala', country: 'India', price: 15000,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200',
    amenities: ['wifi', 'pool', 'ac', 'kitchen', 'sea view', 'parking'],
  },
];

// 2 demo users for seeded reviews
const demoUsers = [
  { username: 'alice', email: 'alice@demo.com', password: 'demo123' },
  { username: 'bob', email: 'bob@demo.com', password: 'demo123' },
];

// Two reviews per listing (32 total) — alternate authors for variety
const reviewTemplates = [
  { rating: 5, comment: 'Absolutely loved every minute. The host was super welcoming and the place is even better than the photos.' },
  { rating: 4, comment: 'Great location and clean. Would definitely come back. Wifi was a bit spotty in the evening.' },
  { rating: 5, comment: 'Perfect getaway. We slept like babies. Already planning the next trip.' },
  { rating: 4, comment: 'Comfortable and well-equipped. The neighborhood has so much character.' },
  { rating: 5, comment: 'Stunning views and warm hospitality. Worth every rupee.' },
  { rating: 3, comment: 'Nice place but a little far from the main spots. Bring a scooter.' },
  { rating: 5, comment: 'Honestly one of the best stays I have had. Beds are heavenly and breakfast was lovely.' },
  { rating: 4, comment: 'Would recommend for couples. Quiet, clean, and thoughtful little touches everywhere.' },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log('Wiping existing data...');
  await Promise.all([Review.deleteMany({}), Listing.deleteMany({}), User.deleteMany({})]);

  console.log('Creating demo users...');
  const users = [];
  for (const u of demoUsers) {
    users.push(await User.create(u));
  }

  console.log(`Inserting ${sampleListings.length} listings...`);
  const listings = await Listing.insertMany(
    sampleListings.map((l) => ({ ...l, owner: users[0]._id }))
  );

  console.log('Creating sample reviews...');
  const reviewsToInsert = [];
  listings.forEach((listing, i) => {
    const r1 = reviewTemplates[i % reviewTemplates.length];
    const r2 = reviewTemplates[(i + 3) % reviewTemplates.length];
    reviewsToInsert.push({ listing: listing._id, author: users[0]._id, ...r1 });
    reviewsToInsert.push({ listing: listing._id, author: users[1]._id, ...r2 });
  });
  await Review.insertMany(reviewsToInsert);

  console.log(`✅ Seeded ${listings.length} listings, ${users.length} users, ${reviewsToInsert.length} reviews`);
  console.log('   Demo logins: alice@demo.com / demo123  |  bob@demo.com / demo123');

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
