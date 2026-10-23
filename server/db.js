// Simple JSON-file database (no MongoDB/MySQL install needed).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const FILE = path.join(__dirname, 'data', 'db.json');
let db = { users: [], vehicles: [], bookings: [] };
const id = () => crypto.randomBytes(6).toString('hex');

function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

function seed() {
  db.users.push(
    { id: id(), name: 'Rental Admin', email: 'admin@rental.com', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
    { id: id(), name: 'Demo Customer', email: 'customer@rental.com', password: bcrypt.hashSync('customer123', 10), role: 'customer' }
  );
  const V = (name, type, pricePerDay, seats, fuel, transmission, icon, description) =>
    db.vehicles.push({ id: id(), name, type, pricePerDay, seats, fuel, transmission, icon, description, maintenance: false });
  V('Maruti Swift', 'Car', 1800, 5, 'Petrol', 'Manual', '🚗', 'Compact and fuel-efficient city hatchback.');
  V('Honda City', 'Car', 2500, 5, 'Petrol', 'Automatic', '🚘', 'Comfortable sedan for long drives.');
  V('Hyundai Creta', 'SUV', 3200, 5, 'Diesel', 'Automatic', '🚙', 'Spacious SUV with great ground clearance.');
  V('Mahindra Thar', 'SUV', 3500, 4, 'Diesel', 'Manual', '🚙', 'Rugged 4x4 for adventure trips.');
  V('Toyota Innova Crysta', 'Van', 3800, 7, 'Diesel', 'Manual', '🚐', 'Perfect for family trips.');
  V('Tempo Traveller', 'Van', 6000, 12, 'Diesel', 'Manual', '🚌', 'Group travel with 12 comfortable seats.');
  V('Tata Nexon EV', 'Car', 3000, 5, 'Electric', 'Automatic', '⚡', 'Zero-emission electric SUV.');
  V('Royal Enfield Classic 350', 'Bike', 1200, 2, 'Petrol', 'Manual', '🏍️', 'Iconic cruiser for highway rides.');
  V('KTM Duke 200', 'Bike', 1000, 2, 'Petrol', 'Manual', '🏍️', 'Sporty and powerful street bike.');
  V('Bajaj Pulsar 150', 'Bike', 700, 2, 'Petrol', 'Manual', '🏍️', 'Reliable everyday commuter bike.');
  V('Honda Activa', 'Scooter', 500, 2, 'Petrol', 'Automatic', '🛵', 'Easy-to-ride city scooter.');
  V('Ola S1 Electric', 'Scooter', 600, 2, 'Electric', 'Automatic', '🛵', 'Quiet and eco-friendly electric scooter.');
}

if (fs.existsSync(FILE)) db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
else { seed(); save(); }

module.exports = { get: () => db, save, id };
