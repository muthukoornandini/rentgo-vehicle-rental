import React, { useState } from 'react';
import { api } from '../api.js';

export default function Auth({ onLogin, onBack }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { onLogin(await api(`/auth/${mode}`, 'POST', form)); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth" onSubmit={submit}>
        <h1>🚗 RentGo</h1>
        <p className="muted center">Vehicle Rental Booking System</p>
        {mode === 'register' && <input placeholder="Full name" value={form.name} onChange={set('name')} required />}
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} required />
        {error && <div className="error">{error}</div>}
        <button className="btn">{mode === 'login' ? 'Log in' : 'Create account'}</button>
        <p className="muted center">
          {mode === 'login' ? 'New customer? ' : 'Already registered? '}
          <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </a>
          {' · '}<a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Back</a>
        </p>
        <p className="hint">Customer: customer@rental.com / customer123<br />Admin: admin@rental.com / admin123</p>
      </form>
    </div>
  );
}
