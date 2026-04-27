import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing._id}`} className="card">
      <div className="card-image" style={{ backgroundImage: `url(${listing.image})` }} />
      <div className="card-body">
        <h3>{listing.title}</h3>
        <p className="muted">{listing.location}, {listing.country}</p>
        <p className="price">₹{listing.price.toLocaleString()} <span className="muted">/ night</span></p>
      </div>
    </Link>
  );
}
