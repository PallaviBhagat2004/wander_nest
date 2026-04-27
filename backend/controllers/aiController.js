const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');
const Listing = require('../models/Listing');

// Groq provides an OpenAI-compatible API, so we reuse the official `openai`
// SDK and just point it at Groq's base URL. Get a free key at
// https://console.groq.com/keys
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Smart Search
 * Takes a natural-language query like:
 *   "cheap beach house in Goa under 3000 with wifi"
 * Calls Groq (Llama 3.3 70B) to extract structured filters, then queries MongoDB.
 */
const smartSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    res.status(400);
    throw new Error('Query is required');
  }

  const systemPrompt = `You convert a user's natural-language travel search into a JSON filter for a MongoDB listings collection.
Listing schema fields: title, description, location (city), country, price (number, in INR), amenities (array of strings).
Return ONLY valid JSON with this shape — no prose, no markdown:
{
  "location": string | null,
  "country": string | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "amenities": string[],
  "keywords": string[]
}
Rules:
- "cheap"/"budget" => maxPrice 3000
- "luxury"/"premium" => minPrice 8000
- "under X"/"below X" => maxPrice X
- "above X"/"over X" => minPrice X
- amenities are short lowercase words like "wifi", "pool", "kitchen", "ac", "parking"
- keywords are descriptive words like "beach", "mountain", "cozy" that should match title/description`;

  let filters;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    filters = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('Groq smart-search error:', err.message);
    filters = { keywords: [query] };
  }

  const mongoQuery = {};
  if (filters.location) mongoQuery.location = new RegExp(filters.location, 'i');
  if (filters.country) mongoQuery.country = new RegExp(filters.country, 'i');
  if (filters.minPrice || filters.maxPrice) {
    mongoQuery.price = {};
    if (filters.minPrice) mongoQuery.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) mongoQuery.price.$lte = Number(filters.maxPrice);
  }
  if (Array.isArray(filters.amenities) && filters.amenities.length) {
    mongoQuery.amenities = { $in: filters.amenities.map((a) => new RegExp(a, 'i')) };
  }
  if (Array.isArray(filters.keywords) && filters.keywords.length) {
    const regex = new RegExp(filters.keywords.join('|'), 'i');
    mongoQuery.$or = [{ title: regex }, { description: regex }];
  }

  const listings = await Listing.find(mongoQuery).sort({ createdAt: -1 }).limit(50);
  res.json({ filters, listings });
});

/**
 * Chatbot
 * Conversational guest-support widget. Has access to live listing data so it
 * can answer "show me cheap stays in Manali" style questions with real items.
 */
const chat = asyncHandler(async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400);
    throw new Error('messages array is required');
  }

  const sample = await Listing.find({})
    .select('title location country price')
    .limit(20)
    .lean();
  const listingContext = sample
    .map((l, i) => `${i + 1}. ${l.title} — ${l.location}, ${l.country} — ₹${l.price}/night`)
    .join('\n');

  const systemPrompt = `You are Wanderlust Assistant, a friendly travel concierge for an Airbnb-style booking site.
You help guests:
- find stays that match their preferences
- understand listings, pricing, and amenities
- with general travel questions
Keep replies short (3-5 sentences), warm, and practical. If users ask for stays, refer to the live listings below and suggest 1-3 specific ones. If their question is unrelated to travel, politely redirect.

Live listings (sample):
${listingContext || '(none yet — invite the user to browse the site once listings are added)'}`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10),
      ],
      temperature: 0.7,
      max_tokens: 400,
    });
    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Groq chat error:', err.message);
    res.status(500).json({ message: 'AI service unavailable. Please try again.' });
  }
});

module.exports = { smartSearch, chat };
