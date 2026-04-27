import { useEffect, useState } from 'react';
import api from '../api/client';
import SearchBar from '../components/SearchBar';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [aiFilters, setAiFilters] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/listings');
      setListings(data);
      setAiFilters(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSmartSearch = async (query) => {
    setSearching(true);
    try {
      const { data } = await api.post('/ai/search', { query });
      setListings(data.listings);
      setAiFilters(data.filters);
    } catch (err) {
      alert('Search failed. Make sure the backend is running and GROQ_API_KEY is set.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container">
      <section className="hero">
        <h1>Find your next escape</h1>
        <p className="muted">Describe your perfect stay in plain English — our AI will find it.</p>
        <SearchBar onSearch={handleSmartSearch} loading={searching} />
      </section>

      {aiFilters && (
        <section className="filter-summary">
          <span>AI understood:</span>
          {aiFilters.location && <span className="tag">📍 {aiFilters.location}</span>}
          {aiFilters.country && <span className="tag">🌏 {aiFilters.country}</span>}
          {aiFilters.minPrice && <span className="tag">≥ ₹{aiFilters.minPrice}</span>}
          {aiFilters.maxPrice && <span className="tag">≤ ₹{aiFilters.maxPrice}</span>}
          {aiFilters.amenities?.map((a) => <span key={a} className="tag">✓ {a}</span>)}
          <button onClick={loadAll} className="btn-ghost small">Clear</button>
        </section>
      )}

      <section className="listings-grid">
        {loading ? (
          <p>Loading listings…</p>
        ) : listings.length === 0 ? (
          <p className="muted">No listings match. Try a different search or <button onClick={loadAll} className="link">show all</button>.</p>
        ) : (
          listings.map((l) => <ListingCard key={l._id} listing={l} />)
        )}
      </section>
    </div>
  );
}
