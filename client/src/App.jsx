import React, { useState } from 'react';
import Auth from './pages/Auth.jsx';
import Vehicles from './pages/Vehicles.jsx';
import Book from './pages/Book.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Admin from './pages/Admin.jsx';
import { todayStr, addDays } from './api.js';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('rg_user') || 'null'));
  const [view, setView] = useState({ name: 'vehicles' });
  // dates are kept here so they carry over between browsing and booking
  const [dates, setDates] = useState({ start: todayStr(), end: addDays(todayStr(), 2) });

  const login = ({ token, user }) => {
    localStorage.setItem('rg_token', token);
    localStorage.setItem('rg_user', JSON.stringify(user));
    setUser(user);
    setView(user.role === 'admin' ? { name: 'admin' } : view.back || { name: 'vehicles' });
  };
  const logout = () => { localStorage.clear(); setUser(null); setView({ name: 'vehicles' }); };

  if (view.name === 'auth') return <Auth onLogin={login} onBack={() => setView({ name: 'vehicles' })} />;

  return (
    <>
      <nav className="nav">
        <h1 onClick={() => setView({ name: 'vehicles' })}>🚗 RentGo</h1>
        <div>
          <button className="link" onClick={() => setView({ name: 'vehicles' })}>Vehicles</button>
          {user?.role === 'customer' && <button className="link" onClick={() => setView({ name: 'mine' })}>My Bookings</button>}
          {user?.role === 'admin' && <button className="link" onClick={() => setView({ name: 'admin' })}>Admin</button>}
          {user ? (
            <>
              <span className="who">{user.name}</span>
              <button className="btn small" onClick={logout}>Logout</button>
            </>
          ) : (
            <button className="btn small" onClick={() => setView({ name: 'auth' })}>Login / Sign up</button>
          )}
        </div>
      </nav>
      <main className="container">
        {view.name === 'vehicles' && (
          <Vehicles dates={dates} setDates={setDates} isAdmin={user?.role === 'admin'}
            onBook={(vehicle) => setView({ name: 'book', vehicle })} />
        )}
        {view.name === 'book' && (
          <Book vehicle={view.vehicle} dates={dates} setDates={setDates} user={user}
            onLogin={() => setView({ name: 'auth', back: view })}
            onDone={() => setView({ name: 'mine' })} />
        )}
        {view.name === 'mine' && user && <MyBookings />}
        {view.name === 'admin' && user?.role === 'admin' && <Admin />}
      </main>
    </>
  );
}
