# 📅 Slotify – Local Service Booking Platform

Slotify is a full-stack web app for discovering and booking local services such as **salons, car cleaning and repair centres**. Customers browse nearby centres, pick a service and a free time slot, and pay online. Service providers list their centres, manage services and time slots, and accept or cancel incoming bookings from a dashboard.

---

## ✨ Features

### For customers
- 🔐 Sign up with **email OTP verification** and log in with JWT authentication
- 🔎 Browse service centres and filter by category (salon, car cleaning, repair, other)
- 📍 Optional location-based search (nearby centres by latitude/longitude and radius)
- 🕒 See real-time slot availability for any date; already booked slots are blocked
- 💳 Pay securely through **Razorpay** (UPI, card, net banking, wallet)
- 📧 Receive an email confirmation after successful payment
- 📋 View all your bookings in **My Bookings**

### For service providers
- 🏪 Add a centre with address, city, phone, working days/hours and time slots
- 🧾 Add multiple service items (name, description, duration, price)
- 📊 Provider dashboard with incoming bookings and earnings from paid bookings
- ✅ Confirm or ❌ cancel bookings

### General
- 🛡️ Role-based access (`user` and `provider`) with protected routes
- 🚫 Double-booking prevention (a slot already pending/confirmed returns `409 Conflict`)
- 🎬 Splash screen and responsive UI

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Lucide React |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose (geospatial `2dsphere` index) |
| Auth | JSON Web Tokens, bcryptjs, email OTP (otp-generator) |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP, or Ethereal test inbox as fallback) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
Slotify/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT protect + providerOnly guards
│   ├── models/
│   │   ├── User.js              # Users (customer / provider), OTP fields
│   │   ├── Service.js           # Service centres, items, slots, location
│   │   └── Booking.js           # Bookings and payment details
│   ├── routes/
│   │   ├── auth.js              # Register, verify OTP, login, profile
│   │   ├── services.js          # Centres, service items, available slots
│   │   ├── bookings.js          # Create and manage bookings
│   │   └── payments.js          # Razorpay order creation + verification
│   ├── utils/
│   │   └── email.js             # OTP and booking confirmation emails
│   ├── test-email.js            # Script to test email configuration
│   ├── server.js                # App entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js         # Axios instance with auth header
│   │   ├── context/AuthContext.jsx
│   │   ├── components/          # Navbar, ServiceCard, Splash
│   │   ├── pages/               # Home, Login, Register, ServiceDetail,
│   │   │                        # Booking, MyBookings, ProviderDashboard,
│   │   │                        # AddService
│   │   ├── App.jsx              # Routes and protected routes
│   │   └── main.jsx
│   ├── index.html               # Loads Razorpay checkout script
│   └── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or later
- A [MongoDB](https://www.mongodb.com/) database (local or MongoDB Atlas)
- A [Razorpay](https://razorpay.com/) account (test keys are fine)
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for sending emails (optional, see below)

### 1. Clone the repository

```bash
git clone https://github.com/bhanukambala123/Slotify.git
cd Slotify
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (optional – if omitted, Ethereal test emails are used and a preview URL is printed in the console)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL allowed by CORS (optional for local development)
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev     # development (nodemon)
# or
npm start       # production
```

The API runs at `http://localhost:5000`. Opening it should return `{ "message": "Slotify API running" }`.

To check your email settings:

```bash
node test-email.js
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

Create a `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

> If `VITE_API_URL` is not set, the frontend falls back to the hosted backend URL configured in `src/api/axios.js`.

---

## 🔌 API Reference

Base URL: `/api`. Routes marked 🔒 need an `Authorization: Bearer <token>` header; 🏪 means provider role only.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register and send a 6-digit OTP to the email (valid 10 minutes) |
| POST | `/auth/verify-otp` | Verify the OTP and receive a token |
| POST | `/auth/login` | Log in with email and password |
| GET | `/auth/me` 🔒 | Get the logged-in user's profile |

### Services
| Method | Endpoint | Description |
|---|---|---|
| GET | `/services` | List centres. Optional query: `category`, `lat`, `lng`, `radius` (metres, default 5000) |
| GET | `/services/:id` | Get one centre |
| GET | `/services/:id/available-slots?date=YYYY-MM-DD` | Slots with availability for a date |
| GET | `/services/provider/mine` 🔒🏪 | Centres owned by the provider |
| POST | `/services` 🔒🏪 | Create a centre |
| PUT | `/services/:id` 🔒🏪 | Update a centre |
| POST | `/services/:id/items` 🔒🏪 | Add a service item to a centre |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/bookings` 🔒 | Book a slot (`serviceId`, `serviceItemId`, `date`, `timeSlot`) |
| GET | `/bookings/my` 🔒 | Current user's bookings |
| GET | `/bookings/provider` 🔒🏪 | Bookings received by the provider |
| GET | `/bookings/:id` 🔒 | Booking details (owner or provider only) |
| PATCH | `/bookings/:id/status` 🔒 | Update status: `pending`, `confirmed`, `completed`, `cancelled` |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/payments/create-order` 🔒 | Create a Razorpay order for a booking |
| POST | `/payments/verify` 🔒 | Verify the payment signature, confirm the booking and send an email |

---

## 🔄 Booking Flow

1. Customer registers, verifies the OTP and logs in.
2. Customer opens a centre, picks a service, date and an available time slot.
3. The backend creates a **pending** booking (service price + ₹19 convenience fee).
4. A Razorpay order is created and the checkout opens.
5. After payment, the signature is verified, the booking becomes **confirmed**, and a confirmation email is sent.
6. The provider sees the booking on the dashboard and can confirm, complete or cancel it.

---

## 🗄️ Data Models

- **User** – name, email, password (hashed), phone, role (`user` / `provider`), location, verification status
- **Service** – provider, centre name, category, address, city, geo location, service items, available slots, working days and hours, rating
- **Booking** – user, service, provider, selected service item, date, time slot, status, payment details (Razorpay order/payment IDs, amount in paise)

---

## ☁️ Deployment

- **Backend (Render):** root directory `backend`, build command `npm install`, start command `npm start`. Add all backend environment variables in the dashboard.
- **Frontend (Vercel):** root directory `frontend`, framework preset Vite. Set `VITE_API_URL` to your deployed backend URL ending in `/api`.
- Add your frontend URL as `CLIENT_URL` on the backend so CORS allows it.

---

## 🔐 Security Notes

- Never commit `.env` files or API keys (they are already listed in `.gitignore`).
- Use a strong, random `JWT_SECRET`.
- Passwords are hashed with bcrypt before being stored.
- Payment signatures are verified on the server before a booking is confirmed.

---

## 🛣️ Future Improvements

- Reviews and ratings for centres
- Image uploads for service centres
- Booking reschedule and refund flow
- Push/SMS notifications
- Map view of nearby centres

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👤 Author

**Bhanu Kambala**
GitHub: [@bhanukambala123](https://github.com/bhanukambala123)

---

⭐ If you like this project, give it a star!
