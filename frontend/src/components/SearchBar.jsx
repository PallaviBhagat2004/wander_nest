import { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const examples = [
    'cheap beach house in Goa',
    'luxury villa with pool',
    'mountain cabin under 4000',
    'hostel in Jaipur with wifi',
  ];

  return (
    <div className="searchbar-wrap">
      <form onSubmit={submit} className="searchbar">
        <span className="search-icon" role="img" aria-label="search">✨</span>
        <input
          type="text"
          placeholder="Try: 'cozy beach house in Goa under ₹3000 with wifi'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'AI Search'}
        </button>
      </form>
      <div className="search-examples">
        <span className="muted">Try:</span>
        {examples.map((ex) => (
          <button key={ex} className="chip" onClick={() => onSearch(ex)} disabled={loading}>
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
