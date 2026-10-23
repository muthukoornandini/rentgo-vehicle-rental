import React, { useState } from 'react';
import { api, money, todayStr, daysBetween } from '../api.js';

export default function Book({ vehicle: v, dates, setDates, user, onLogin, onDone }) {
  const [form, setForm] = useState({ pickupLocation: '', phone: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const days = daysBetween(dates.start, dates.end);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/bookings', 'POST', { vehicleId: v.id, startDate: dates.start, endDate: dates.end, ...form });
      onDone();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="two-col">
      <div className="card center">
        <div className="icon big">{v.icon}</div>
        <h2>{v.name}</h2>
        <p className="muted">{v.description}</p>
        <div className="meta center-meta">
          <span className="tag">{v.type}</span><span className="tag">👥 {v.seats} seats</span>
          <span className="tag">⛽ {v.fuel}</span><span className="tag">⚙️ {v.transmission}</span>
        </div>
        <h3>{money(v.pricePerDay)} <span className="muted small-text">/ day</span></h3>
      </div>

      <form className="card" onSubmit={submit}>
        <h3>Booking Details</h3>
        <label>Pickup date
          <input type="date" min={todayStr()} value={dates.start}
            onChange={(e) => setDates({ start: e.target.value, end: dates.end < e.target.value ? e.target.value : dates.end })} />
        </label>
        <label>Return date
          <input type="date" min={dates.start} value={dates.end} onChange={(e) => setDates({ ...dates, end: e.target.value })} />
        </label>
        <div className="summary">
          {days ? <>{days} day{days > 1 ? 's' : ''} × {money(v.pricePerDay)} = <b>{money(days * v.pricePerDay)}</b></> : 'Choose valid dates'}
        </div>
        {user ? (
          <>
            <input placeholder="Pickup location / city" value={form.pickupLocation} onChange={set('pickupLocation')} required />
            <input placeholder="Phone number" value={form.phone} onChange={set('phone')} required />
            <small className="muted">Payment is made at vehicle pickup. Keep your driving licence ready.</small>
            {error && <div className="error">{error}</div>}
            <button className="btn" disabled={!days}>Confirm Booking</button>
          </>
        ) : (
          <>
            <p className="muted">Please log in to complete your booking.</p>
            <button type="button" className="btn" onClick={onLogin}>Login / Sign up</button>
          </>
        )}
      </form>
    </div>
  );
}
