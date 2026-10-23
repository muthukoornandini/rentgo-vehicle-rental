# 🚗 RentGo – Vehicle Rental Booking System

Browse vehicles and manage bookings. Full-stack, cloud-ready.

| Layer    | Tech                                              |
|----------|---------------------------------------------------|
| Frontend | HTML, CSS, JavaScript, **React.js** (Vite)        |
| Backend  | **Node.js + Express** REST API, JWT auth, bcrypt  |
| Storage  | JSON-file database (no DB install needed)         |
| Deploy   | Docker / Render / Railway / AWS / any VM          |

## Features
**Customers**
- Browse cars, SUVs, vans, bikes and scooters without logging in
- Pick pickup and return dates: vehicles already booked for those dates are marked unavailable
- Search, filter by type, sort by price, live total-price estimate
- Book a vehicle (pay at pickup), view "My Bookings", cancel pending/confirmed bookings

**Admin**
- Dashboard: bookings, pending, revenue, vehicles, vehicles free today, customers
- Manage bookings: Pending → Confirmed → Active → Completed (or Cancelled)
- Manage vehicles: add, change price, mark under maintenance, delete

**Smart logic**
- **Double-booking prevention**: the server rejects any booking whose dates overlap an
  existing Pending/Confirmed/Active booking for the same vehicle.
- Total price and days are calculated on the server (inclusive of pickup and return day).
- Past dates and return-before-pickup are rejected. Passwords hashed, JWT auth, admin-only routes.

## Run on your laptop (Windows / Mac / Linux)
Requirements: **Node.js 18+** (https://nodejs.org)

```bash
cd vehicle-rental
cd server
npm install
npm start
```
Open **http://localhost:5000** (the React app is already built in `client/dist`).

**Demo logins**
- Customer: `customer@rental.com` / `customer123`
- Admin: `admin@rental.com` / `admin123`

## Development mode (edit React code)
Terminal 1: `cd server && npm install && npm start`
Terminal 2: `cd client && npm install && npm run dev` → http://localhost:5173
Rebuild for production after changes: `cd client && npm run build`

## Deploy to the cloud
```bash
docker build -t rentgo .
docker run -p 5000:5000 -e JWT_SECRET=your-secret rentgo
```
Render.com (free): push to GitHub → New Web Service → Runtime: Docker. Set `JWT_SECRET`.
(Free tiers reset local files; use a managed DB for permanent data.)

## API summary
`POST /api/auth/register|login` · `GET /api/vehicles?start=&end=` ·
`POST|PUT|DELETE /api/vehicles` (admin) · `POST /api/bookings` · `GET /api/bookings/me` ·
`PUT /api/bookings/:id/cancel` · `GET /api/bookings` (admin) · `PUT /api/bookings/:id/status` (admin) ·
`GET /api/stats` (admin) · `GET /api/health`
