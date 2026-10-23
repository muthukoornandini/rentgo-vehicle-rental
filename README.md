# RentGo – Vehicle Rental Booking System

A full-stack web application that allows users to explore vehicles, book rentals, and manage their bookings online. RentGo includes an administrative dashboard for managing vehicles and handling booking requests.

## 🌐 Live Demo

**[Visit RentGo – Live Application](https://rentgo-vehicle-rental.onrender.com)**

## 📂 GitHub Repository

**[View Source Code on GitHub](https://github.com/muthukoornandini/rentgo-vehicle-rental)**

## ✨ Features

- **Vehicle Browsing:** Explore available cars, SUVs, bikes, scooters, and vans.
- **Vehicle Details:** View rental prices, vehicle types, seating capacity, fuel type, and descriptions.
- **User Authentication:** Register and log in to the application.
- **Online Booking:** Select pickup and return dates, pickup location, and contact details.
- **Availability Checking:** Check vehicle availability and prevent overlapping bookings.
- **My Bookings:** View personal booking records and manage eligible cancellations.
- **Admin Dashboard:** View booking statistics and manage vehicles.
- **Booking Management:** Review booking requests and update their statuses.
- **Responsive Interface:** Access the application through a modern web browser.
- **Cloud Deployment:** Deploy the full-stack application using Render.

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Data Storage | JSON file-based database |
| Styling | CSS |
| Deployment | Render |
| Version Control | Git, GitHub |
| Containerization | Docker |

## 🏗️ Application Architecture

```text
User / Administrator
        |
        v
 React Frontend (Vite)
        |
        v
 Node.js + Express API
        |
        v
 JSON File Database
```

## ⚙️ Getting Started Locally

### Prerequisites

- Node.js and npm
- Git
- A code editor such as Visual Studio Code

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/muthukoornandini/rentgo-vehicle-rental.git
   ```

2. Open the project directory:

   ```bash
   cd rentgo-vehicle-rental
   ```

3. Install the project dependencies:

   ```bash
   npm run setup
   ```

4. Build the frontend:

   ```bash
   npm run build
   ```

5. Start the application:

   ```bash
   npm start
   ```

6. Open `http://localhost:5000` in your browser.

## 🔄 How It Works

1. Users register or log in.
2. They browse vehicles and check availability.
3. They select rental dates and submit a booking request.
4. The application validates the requested dates and vehicle availability.
5. The administrator reviews the request and updates its status.
6. Users can view their booking details in their account.

## 🔐 Security Considerations

- Passwords are hashed using bcryptjs.
- Authentication uses JSON Web Tokens.
- Administrative endpoints require authentication and an administrator role.
- Deployment secrets should be configured using environment variables.

**Note:** The current version uses JSON file-based storage. Persistent database storage should be configured before using the application for production bookings.

## 🚀 Future Enhancements

- Integration with MongoDB or PostgreSQL.
- Persistent cloud database storage.
- Online payment gateway integration.
- Email and SMS booking notifications.
- Advanced search and filtering.
- Booking history and reporting.
- QR-code-based booking confirmation.

## 👩‍💻 Developer

**Muthukoornandini**

- GitHub: [@muthukoornandini](https://github.com/muthukoornandini)
- Live Project: [RentGo](https://rentgo-vehicle-rental.onrender.com)

---

*RentGo – Making vehicle rentals simple, convenient, and accessible.*
