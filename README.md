# Wanderlust AI — MERN + Groq

An Airbnb-style booking site rebuilt as a **MERN stack** project with two AI features powered by **Groq** (free, OpenAI-compatible, blazing fast — runs Llama 3.3 70B):

1. **AI Chatbot** — a floating concierge widget that answers guest questions and recommends real listings.
2. **Smart Search** — type in plain English ("cheap beach house in Goa with wifi") and the AI converts it into a MongoDB filter query.

Inspired by [PallaviBhagat2004/Wanderlust](https://github.com/PallaviBhagat2004/Wanderlust) — rebuilt from scratch as React + Express.

---

## Project structure

```
wanderlust-ai/
├── backend/                Node + Express + MongoDB API
│   ├── server.js           Entry point
│   ├── config/db.js        Mongo connection
│   ├── models/             Mongoose schemas (Listing, User)
│   ├── routes/             Express routers (listings, auth, ai)
│   ├── controllers/        Route handlers
│   ├── middleware/         Auth + error handler
│   ├── seed/seedData.js    Sample listings seeder
│   └── .env.example        Copy to .env and fill in
│
└── frontend/               Vite + React SPA
    ├── index.html
    ├── src/
    │   ├── main.jsx        App bootstrap
    │   ├── App.jsx         Routes + layout
    │   ├── api/client.js   Axios instance with JWT
    │   ├── context/        Auth context
    │   ├── components/     Navbar, ListingCard, SearchBar, ChatBot, Footer
    │   ├── pages/          Home, ListingDetail, NewListing, Login, Signup
    │   └── index.css       All styles (Airbnb-inspired)
    └── .env.example
```

---

## Prerequisites

Install once on your machine:

| Tool | Version | Why |
|------|---------|-----|
| **Node.js** | 18 or newer | Runs both backend and frontend |
| **MongoDB** | Local install **or** Atlas cloud | Database |
| **Groq API key** | — | **Free**, no credit card. Get one at https://console.groq.com/keys |

> 💡 If you don't want to install MongoDB locally, sign up for [MongoDB Atlas](https://www.mongodb.com/atlas) free tier and use its connection string.

---

## Setup — Step by step

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/wanderlust   # or your Atlas URL
JWT_SECRET=any_long_random_string_for_signing_tokens
GROQ_API_KEY=gsk_...your-key-here
CLIENT_ORIGIN=http://localhost:5173
```

Seed the database with sample listings:

```bash
npm run seed
```

Start the API:

```bash
npm run dev   # uses nodemon (auto-restart on changes)
# or:
npm start     # plain node
```

You should see:
```
MongoDB connected
API running on http://localhost:5000
```

Test it:
```bash
curl http://localhost:5000/api/health
# {"ok":true,"service":"wanderlust-ai"}
```

### 2. Frontend

In a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 in your browser.

---

## How the AI features work

### Smart Search (`POST /api/ai/search`)

**File:** `backend/controllers/aiController.js` → `smartSearch`

Flow:
1. User types a sentence in the search bar (e.g. *"luxury villa with pool under 15000 in Udaipur"*).
2. Frontend sends it to `POST /api/ai/search`.
3. Backend asks Groq (Llama 3.3 70B) to convert it into JSON like:
   ```json
   { "location": "Udaipur", "maxPrice": 15000, "amenities": ["pool"], "keywords": ["luxury", "villa"] }
   ```
4. Backend builds a MongoDB filter from that JSON and returns matching listings + the parsed filters (so the UI can show "AI understood: 📍 Udaipur, ≤ ₹15000, ✓ pool").

The model used is `llama-3.3-70b-versatile` via Groq's OpenAI-compatible API, with `response_format: { type: 'json_object' }` to guarantee valid JSON. Because Groq exposes an OpenAI-compatible endpoint, we keep using the official `openai` SDK and just point its `baseURL` at `https://api.groq.com/openai/v1`.

### AI Chatbot (`POST /api/ai/chat`)

**File:** `backend/controllers/aiController.js` → `chat`

Flow:
1. User clicks the 💬 button → chat panel opens.
2. Each message is appended to a list and sent to `POST /api/ai/chat` with the full short history.
3. Backend builds a **system prompt** that includes a sample of live listings from MongoDB, so the bot can recommend real places.
4. Groq replies with a friendly 3–5 sentence response (typically <1 second — Groq is very fast).

The chat is **stateless on the server** — the frontend keeps the message history and resends it each turn. This keeps the backend simple and lets you add streaming later if you want.

---

## API reference

| Method | Path | Body | Auth | Notes |
|--------|------|------|------|-------|
| GET    | `/api/health` | — | — | Health check |
| GET    | `/api/listings` | — | — | List all (supports `?q=&location=&minPrice=&maxPrice=`) |
| GET    | `/api/listings/:id` | — | — | Listing detail |
| POST   | `/api/listings` | `{ title, description, location, country, price, image, amenities }` | ✅ | Create listing |
| PUT    | `/api/listings/:id` | partial | ✅ owner | Update |
| DELETE | `/api/listings/:id` | — | ✅ owner | Delete |
| POST   | `/api/auth/signup` | `{ username, email, password }` | — | Returns JWT |
| POST   | `/api/auth/login` | `{ email, password }` | — | Returns JWT |
| POST   | `/api/ai/search` | `{ query: "..." }` | — | Smart search |
| POST   | `/api/ai/chat` | `{ messages: [{role, content}, ...] }` | — | Chatbot |

Auth: send `Authorization: Bearer <token>` header.

---

## Try it out — guided tour

1. Open http://localhost:5173 → you'll see seeded listings.
2. **Smart search**: type *"cheap mountain stay under 4000"* → the page narrows to matching cards and shows the parsed filters.
3. Click any chip example like *"luxury villa with pool"* — instant AI search.
4. Click the 💬 button → ask *"What's the cheapest place you have?"* — the bot replies with a real listing from your DB.
5. Click **Sign Up** → create an account → click **+ Add Listing** → fill the form → it appears on the home page.

---

## Common issues

| Problem | Fix |
|--------|----|
| `MongoDB connection error` | MongoDB isn't running. Start it (`mongod`) or use an Atlas connection string. |
| `AI service unavailable` in chat | `GROQ_API_KEY` is missing/invalid in `backend/.env`. Get a free key at https://console.groq.com/keys. |
| Frontend can't reach API | Backend not running on port 5000, or `VITE_API_URL` mismatch in `frontend/.env`. |
| CORS error | Make sure `CLIENT_ORIGIN` in backend `.env` matches the frontend origin (default `http://localhost:5173`). |
| `npm install` fails | Use Node 18+. Delete `node_modules` and `package-lock.json`, retry. |

---

## Where to extend it next

- **Bookings**: add a `Booking` model + `/api/bookings` routes.
- **Reviews**: re-add the rating/comment schema from the original Wanderlust.
- **Image upload**: replace the URL field with Cloudinary or S3.
- **Streaming chat**: switch the chatbot to Groq's streaming API for a typing effect (already supported via `stream: true`).
- **AI listing description**: in `NewListing.jsx`, add a "Generate description" button that calls a new `/api/ai/describe` endpoint.
- **AI review summary**: cache a one-line summary on each listing whenever a new review is added.

---

## Deployment outline

- **Backend** → Render / Railway / Fly.io. Set the same env vars.
- **Frontend** → Vercel / Netlify. Set `VITE_API_URL` to your deployed backend URL.
- **Database** → MongoDB Atlas (free tier is plenty to start).
- **CORS** → Update `CLIENT_ORIGIN` in backend env to the deployed frontend URL.

---

## License

MIT — use it, fork it, ship it.
