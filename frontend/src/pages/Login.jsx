import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container narrow">
      <h1>Welcome back</h1>
      <form onSubmit={submit} className="form">
        <label>Email<input type="email" name="email" value={form.email} onChange={change} required /></label>
        <label>Password<input type="password" name="password" value={form.password} onChange={change} required /></label>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Logging in…' : 'Login'}
        </button>
      </form>
      <p className="muted">No account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}
