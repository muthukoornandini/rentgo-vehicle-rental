import React, { useEffect, useState } from 'react';
import { api, money, niceDate } from '../api.js';

const STATUSES = ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];
const blank = { name: '', type: 'Car', pricePerDay: '', seats: 5, fuel: 'Petrol', transmission: 'Manual', icon: '🚗', description: '' };

function VehicleRow({ v, onSave, onDelete }) {
  const [price, setPrice] = useState(v.pricePerDay);
  const [maint, setMaint] = useState(v.maintenance);
  return (
    <tr>
      <td>{v.icon} {v.name}</td>
      <td>{v.type}</td>
      <td><input className="mini" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></td>
      <td><label><input type="checkbox" checked={maint} onChange={(e) => setMaint(e.target.checked)} /> Maintenance</label></td>
      <td>
        <button className="btn small" onClick={() => onSave(v.id, { pricePerDay: price, maintenance: maint })}>Save</button>{' '}
        <button className="btn small danger-btn" onClick={() => onDelete(v.id)}>Delete</button>
      </td>
    </tr>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('bookings');
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState('');

  const load = () => {
    api('/stats').then(setStats);
    api('/vehicles').then(setVehicles);
    api('/bookings').then(setBookings);
  };
  useEffect(load, []);

  const run = async (fn) => { try { await fn(); setMsg(''); load(); } catch (e) { setMsg('❌ ' + e.message); } };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h2>Admin Dashboard</h2>
      {stats && (
        <div className="stats">
          <div className="card stat"><b>{stats.bookings}</b><span>Bookings</span></div>
          <div className="card stat"><b>{stats.pending}</b><span>Pending</span></div>
          <div className="card stat"><b>{money(stats.revenue)}</b><span>Revenue</span></div>
          <div className="card stat"><b>{stats.vehicles}</b><span>Vehicles</span></div>
          <div className="card stat"><b>{stats.availableToday}</b><span>Free today</span></div>
          <div className="card stat"><b>{stats.customers}</b><span>Customers</span></div>
        </div>
      )}
      <div className="chips">
        <button className={'chip ' + (tab === 'bookings' ? 'active' : '')} onClick={() => setTab('bookings')}>Manage Bookings</button>
        <button className={'chip ' + (tab === 'vehicles' ? 'active' : '')} onClick={() => setTab('vehicles')}>Manage Vehicles</button>
      </div>
      {msg && <div className="error">{msg}</div>}

      {tab === 'bookings' && (
        <div className="card">
          {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
          {bookings.map((b) => (
            <div className="order-admin" key={b.id}>
              <div className="row">
                <b>{b.id} · {b.userName} · {b.vehicleIcon} {b.vehicleName}</b>
                <select value={b.status} onChange={(e) => run(() => api(`/bookings/${b.id}/status`, 'PUT', { status: e.target.value }))}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="small-text muted">
                📅 {niceDate(b.startDate)} → {niceDate(b.endDate)} ({b.days}d) · {money(b.total)} · 📍 {b.pickupLocation} · 📞 {b.phone}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'vehicles' && (
        <>
          <form className="card" onSubmit={(e) => { e.preventDefault(); run(async () => { await api('/vehicles', 'POST', form); setForm(blank); }); }}>
            <h3>Add Vehicle</h3>
            <input placeholder="Vehicle name" value={form.name} onChange={set('name')} required />
            <input placeholder="Description" value={form.description} onChange={set('description')} />
            <div className="optrow">
              <select value={form.type} onChange={set('type')}>{['Car', 'SUV', 'Van', 'Bike', 'Scooter'].map((t) => <option key={t}>{t}</option>)}</select>
              <select value={form.fuel} onChange={set('fuel')}>{['Petrol', 'Diesel', 'Electric', 'CNG'].map((t) => <option key={t}>{t}</option>)}</select>
              <select value={form.transmission} onChange={set('transmission')}>{['Manual', 'Automatic'].map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div className="optrow">
              <input type="number" min="1" placeholder="Price per day (₹)" value={form.pricePerDay} onChange={set('pricePerDay')} required />
              <input type="number" min="1" placeholder="Seats" value={form.seats} onChange={set('seats')} />
              <input placeholder="Emoji icon" value={form.icon} onChange={set('icon')} />
            </div>
            <button className="btn">Add Vehicle</button>
          </form>
          <div className="card">
            <table>
              <thead><tr><th>Vehicle</th><th>Type</th><th>₹ / day</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {vehicles.map((v) => (
                  <VehicleRow key={v.id + v.pricePerDay + v.maintenance} v={v}
                    onSave={(id, d) => run(() => api('/vehicles/' + id, 'PUT', d))}
                    onDelete={(id) => window.confirm('Delete this vehicle?') && run(() => api('/vehicles/' + id, 'DELETE'))} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
