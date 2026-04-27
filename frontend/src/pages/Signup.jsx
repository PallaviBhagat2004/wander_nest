import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      login(data);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container narrow">
      <h1>Create your account</h1>
      <form onSubmit={submit} className="form">
        <label>Username<input name="username" value={form.username} onChange={change} required /></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={change} required /></label>
        <label>Password (min 6)<input type="password" name="password" value={form.password} onChange={change} required minLength={6} /></label>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Creating…' : 'Sign up'}
        </button>
      </form>
      <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
