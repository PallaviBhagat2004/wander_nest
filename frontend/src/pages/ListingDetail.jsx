import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

function Stars({ value, size = 16 }) {
  const full = Math.round(value);
  return (
    <span className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= full ? 'star filled' : 'star'}>★</span>
      ))}
    </span>
  );
}

function ReviewForm({ listingId, onAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/listings/${listingId}/reviews`, { rating, comment });
      onAdded(data);
      setComment('');
      setRating(5);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="review-form">
      <h3>Leave a review</h3>
      <div className="rating-picker">
        <span>Your rating:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className={`star-btn ${n <= rating ? 'active' : ''}`}
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        placeholder="Share your experience…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        required
      />
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Posting…' : 'Post review'}
      </button>
    </form>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/listings/${id}`)
      .then((res) => {
        setListing(res.data);
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing?')) return;
    await api.delete(`/listings/${id}`);
    navigate('/');
  };

  const handleReviewAdded = (review) => {
    const next = [review, ...reviews];
    setReviews(next);
    setAvgRating(Math.round((next.reduce((s, r) => s + r.rating, 0) / next.length) * 10) / 10);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/listings/${id}/reviews/${reviewId}`);
      const next = reviews.filter((r) => r._id !== reviewId);
      setReviews(next);
      setAvgRating(
        next.length === 0 ? 0 : Math.round((next.reduce((s, r) => s + r.rating, 0) / next.length) * 10) / 10
      );
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  if (loading) return <div className="container"><p>Loading…</p></div>;
  if (!listing) return <div className="container"><p>Listing not found.</p></div>;

  const isOwner = user && listing.owner && (listing.owner._id === user._id || listing.owner === user._id);

  return (
    <div className="container">
      <div className="detail">
        <img src={listing.image} alt={listing.title} className="detail-image" />
        <div className="detail-body">
          <h1>{listing.title}</h1>
          <p className="muted">{listing.location}, {listing.country}</p>
          <div className="detail-meta">
            <Stars value={avgRating} size={18} />
            <span>{avgRating > 0 ? avgRating.toFixed(1) : 'No ratings yet'}</span>
            {reviews.length > 0 && <span className="muted">· {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>}
          </div>
          <p className="price big">₹{listing.price.toLocaleString()} <span className="muted">/ night</span></p>
          <p>{listing.description}</p>
          {listing.amenities?.length > 0 && (
            <div className="amenities">
              <h3>Amenities</h3>
              <ul>{listing.amenities.map((a) => <li key={a}>{a}</li>)}</ul>
            </div>
          )}
          {isOwner && (
            <button onClick={handleDelete} className="btn-danger">Delete listing</button>
          )}
        </div>
      </div>

      <section className="reviews-section">
        <h2>Reviews {reviews.length > 0 && <span className="muted">({reviews.length})</span>}</h2>

        {user ? (
          <ReviewForm listingId={id} onAdded={handleReviewAdded} />
        ) : (
          <p className="muted">
            <Link to="/login" className="link">Login</Link> to leave a review.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="muted">No reviews yet — be the first!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => {
              const isMine = user && r.author && r.author._id === user._id;
              return (
                <article key={r._id} className="review-card">
                  <header className="review-head">
                    <strong>{r.author?.username || 'Guest'}</strong>
                    <Stars value={r.rating} />
                    <span className="muted small">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    {isMine && (
                      <button onClick={() => handleDeleteReview(r._id)} className="link small">
                        Delete
                      </button>
                    )}
                  </header>
                  <p>{r.comment}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
