import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function NewListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    country: '',
    price: '',
    image: '',
    amenities: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        amenities: form.amenities ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean) : [],
      };
      const { data } = await api.post('/listings', payload);
      navigate(`/listings/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>Add a new listing</h1>
      <form onSubmit={submit} className="form">
        <label>Title<input name="title" value={form.title} onChange={change} required /></label>
        <label>Description<textarea name="description" value={form.description} onChange={change} required rows={4} /></label>
        <label>Location<input name="location" value={form.location} onChange={change} required /></label>
        <label>Country<input name="country" value={form.country} onChange={change} required /></label>
        <label>Price (₹ per night)<input type="number" name="price" value={form.price} onChange={change} required min="0" /></label>
        <label>Image URL<input name="image" value={form.image} onChange={change} placeholder="https://…" /></label>
        <label>Amenities (comma-separated)<input name="amenities" value={form.amenities} onChange={change} placeholder="wifi, ac, kitchen" /></label>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving…' : 'Create listing'}
        </button>
      </form>
    </div>
  );
}
