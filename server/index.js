const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'rental-dev-secret-change-me';
const STATUSES = ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];
const BLOCKING = ['Pending', 'Confirmed', 'Active']; // statuses that reserve a vehicle

app.use(cors());
app.use(express.json());

// ---------- helpers ----------
const sign = (u) => jwt.sign({ id: u.id, role: u.role, name: u.name }, SECRET, { expiresIn: '8h' });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
function auth(req, res, next) {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Please log in to continue.' });
  }
}
const adminOnly = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only.' });

const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(Date.parse(s));
// Days are inclusive: 10th -> 12th = 3 days
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5) + 1;
// A vehicle is free if no active booking overlaps the requested date range
const isFree = (vehicleId, start, end) =>
  !store.get().bookings.some((b) =>
    b.vehicleId === vehicleId && BLOCKING.includes(b.status) && start <= b.endDate && end >= b.startDate);

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'Vehicle Rental' }));

// ---------- auth ----------
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: 'Name, email and a password (6+ chars) are required.' });
  const db = store.get();
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(409).json({ error: 'Email already registered.' });
  const user = { id: store.id(), name, email, password: bcrypt.hashSync(password, 10), role: 'customer' };
  db.users.push(user);
  store.save();
  res.json({ token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = store.get().users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.password))
    return res.status(401).json({ error: 'Invalid email or password.' });
  res.json({ token: sign(user), user: publicUser(user) });
});

// ---------- vehicles (browsing is public) ----------
// Optional ?start=YYYY-MM-DD&end=YYYY-MM-DD marks each vehicle available / not for those dates
app.get('/api/vehicles', (req, res) => {
  const { start, end } = req.query;
  const useDates = isDate(start) && isDate(end) && end >= start;
  res.json(store.get().vehicles.map((v) => ({
    ...v,
    available: !v.maintenance && (!useDates || isFree(v.id, start, end))
  })));
});

function cleanVehicle(b) {
  return {
    name: String(b.name || '').trim(), type: b.type || 'Car', pricePerDay: Number(b.pricePerDay),
    seats: parseInt(b.seats) || 2, fuel: b.fuel || 'Petrol', transmission: b.transmission || 'Manual',
    icon: b.icon || '🚗', description: b.description || '', maintenance: !!b.maintenance
  };
}

app.post('/api/vehicles', auth, adminOnly, (req, res) => {
  const v = cleanVehicle(req.body);
  if (!v.name || !(v.pricePerDay > 0)) return res.status(400).json({ error: 'Name and a valid price per day are required.' });
  const vehicle = { id: store.id(), ...v };
  store.get().vehicles.push(vehicle);
  store.save();
  res.json(vehicle);
});

app.put('/api/vehicles/:id', auth, adminOnly, (req, res) => {
  const v = store.get().vehicles.find((x) => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: 'Vehicle not found.' });
  const upd = cleanVehicle({ ...v, ...req.body });
  if (!upd.name || !(upd.pricePerDay > 0)) return res.status(400).json({ error: 'Invalid price.' });
  Object.assign(v, upd);
  store.save();
  res.json(v);
});

app.delete('/api/vehicles/:id', auth, adminOnly, (req, res) => {
  const db = store.get();
  if (db.bookings.some((b) => b.vehicleId === req.params.id && BLOCKING.includes(b.status)))
    return res.status(400).json({ error: 'This vehicle has active bookings. Cancel or complete them first.' });
  db.vehicles = db.vehicles.filter((x) => x.id !== req.params.id);
  store.save();
  res.json({ ok: true });
});

// ---------- bookings ----------
app.post('/api/bookings', auth, (req, res) => {
  const { vehicleId, startDate, endDate, pickupLocation, phone } = req.body;
  if (!isDate(startDate) || !isDate(endDate)) return res.status(400).json({ error: 'Please choose valid pickup and return dates.' });
  if (startDate < today()) return res.status(400).json({ error: 'Pickup date cannot be in the past.' });
  if (endDate < startDate) return res.status(400).json({ error: 'Return date cannot be before pickup date.' });
  if (!pickupLocation || !phone) return res.status(400).json({ error: 'Pickup location and phone number are required.' });

  const db = store.get();
  const v = db.vehicles.find((x) => x.id === vehicleId);
  if (!v) return res.status(404).json({ error: 'Vehicle not found.' });
  if (v.maintenance) return res.status(400).json({ error: 'This vehicle is under maintenance.' });
  if (!isFree(v.id, startDate, endDate))
    return res.status(409).json({ error: 'Sorry, this vehicle is already booked for those dates. Try other dates.' });

  const days = daysBetween(startDate, endDate);
  const booking = {
    id: 'BK' + Date.now().toString().slice(-7), userId: req.user.id, userName: req.user.name,
    vehicleId: v.id, vehicleName: v.name, vehicleIcon: v.icon, pricePerDay: v.pricePerDay,
    startDate, endDate, days, total: days * v.pricePerDay,
    pickupLocation, phone, status: 'Pending', date: new Date().toISOString()
  };
  db.bookings.push(booking);
  store.save();
  res.json(booking);
});

app.get('/api/bookings/me', auth, (req, res) =>
  res.json(store.get().bookings.filter((b) => b.userId === req.user.id).reverse()));

app.put('/api/bookings/:id/cancel', auth, (req, res) => {
  const b = store.get().bookings.find((x) => x.id === req.params.id && x.userId === req.user.id);
  if (!b) return res.status(404).json({ error: 'Booking not found.' });
  if (!['Pending', 'Confirmed'].includes(b.status)) return res.status(400).json({ error: 'Only pending or confirmed bookings can be cancelled.' });
  b.status = 'Cancelled';
  store.save();
  res.json(b);
});

// ---------- admin ----------
app.get('/api/bookings', auth, adminOnly, (req, res) => res.json([...store.get().bookings].reverse()));

app.put('/api/bookings/:id/status', auth, adminOnly, (req, res) => {
  const b = store.get().bookings.find((x) => x.id === req.params.id);
  const { status } = req.body;
  if (!b) return res.status(404).json({ error: 'Booking not found.' });
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  if (b.status === 'Cancelled' && status !== 'Cancelled') return res.status(400).json({ error: 'Cancelled bookings cannot be reopened.' });
  b.status = status;
  store.save();
  res.json(b);
});

app.get('/api/stats', auth, adminOnly, (req, res) => {
  const { vehicles, bookings, users } = store.get();
  const t = today();
  res.json({
    vehicles: vehicles.length,
    availableToday: vehicles.filter((v) => !v.maintenance && isFree(v.id, t, t)).length,
    customers: users.filter((u) => u.role === 'customer').length,
    bookings: bookings.length,
    pending: bookings.filter((b) => b.status === 'Pending').length,
    revenue: bookings.filter((b) => b.status !== 'Cancelled').reduce((s, b) => s + b.total, 0)
  });
});

// ---------- serve React build ----------
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (_, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  app.get('/', (_, res) => res.send('API running. Build the client first: npm run build --prefix client'));
}

app.listen(PORT, () => console.log(`Vehicle Rental running at http://localhost:${PORT}`));
