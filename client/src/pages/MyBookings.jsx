import React, { useEffect, useState } from 'react';
import { api, money, niceDate } from '../api.js';

export default function MyBookings() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');
  const load = () => api('/bookings/me').then(setList);
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await api(`/bookings/${id}/cancel`, 'PUT'); setMsg(''); load(); }
    catch (e) { setMsg(e.message); }
  };

  return (
    <>
      <h2>My Bookings</h2>
      {msg && <div className="error">{msg}</div>}
      {list.length === 0 && <div className="card muted">You have no bookings yet.</div>}
      {list.map((b) => (
        <div className="card" key={b.id}>
          <div className="row">
            <b>{b.vehicleIcon} {b.vehicleName} <span className="muted">· {b.id}</span></b>
            <span className={'status ' + b.status}>{b.status}</span>
          </div>
          <div className="row">
            <span>📅 {niceDate(b.startDate)} → {niceDate(b.endDate)} ({b.days} day{b.days > 1 ? 's' : ''})</span>
            <b>{money(b.total)}</b>
          </div>
          <div className="muted small-text">📍 {b.pickupLocation} · 📞 {b.phone}</div>
          {['Pending', 'Confirmed'].includes(b.status) && (
            <button className="btn small danger-btn" onClick={() => cancel(b.id)}>Cancel booking</button>
          )}
        </div>
      ))}
    </>
  );
}
