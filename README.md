# NeighborHub

A local community marketplace where neighbors can buy and sell items, offer services, message each other, place orders, and leave reviews. Includes a full admin dashboard for platform management.

**Live URL:** _https://your-app.vercel.app_ _(update after deployment)_

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router 7 |
| Backend | Node.js, Express 5 |
| Database | MySQL (hosted on Railway) |
| Auth | JWT (stored in localStorage) |
| Image Uploads | Multer (stored on server filesystem) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Features

- **Authentication** — Register, login, logout with BCrypt password hashing and JWT
- **Listings** — Create, browse, edit, and delete product/service listings with image uploads
- **Orders** — Place orders on listings; sellers can update order status
- **Messaging** — Real-time polling-based conversations between users
- **Reviews** — Leave reviews on completed orders
- **Saved Listings** — Bookmark listings for later
- **Notifications** — In-app notification bell with unread count
- **Admin Dashboard** — User management, listing moderation, analytics with charts

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- MySQL (local or Railway)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/neighborhub.git
cd neighborhub
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure environment variables

**Frontend** — create `.env` at the project root (leave blank for local dev):

```env
# Leave empty — Vite proxy handles /api → localhost:5000 in dev
VITE_API_URL=
```

**Backend** — create `server/.env`:

```env
PORT=5000
NODE_ENV=development

# MySQL connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=neighborhub

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### 5. Set up the database

Run the SQL files in `database/` against your MySQL instance to create tables.

### 6. Start both servers

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)  
Backend API: [http://localhost:5000](http://localhost:5000)

---

## Environment Variables Reference

### Frontend (`.env` at project root)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL (production only) | `https://neighborhub-api.onrender.com` |

### Backend (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `DB_HOST` | MySQL host | Railway hostname |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | Railway user |
| `DB_PASSWORD` | MySQL password | Railway password |
| `DB_NAME` | Database name | `neighborhub` |
| `JWT_SECRET` | Secret for signing JWTs | Long random string |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CLIENT_URL` | Allowed CORS origin | `https://your-app.vercel.app` |

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all backend environment variables in the Render dashboard (use Railway DB credentials)
7. Note the Render URL (e.g., `https://neighborhub-api.onrender.com`)

### Frontend → Vercel

1. Import the repository on [vercel.com](https://vercel.com)
2. Framework preset: **Vite**
3. Add environment variable: `VITE_API_URL = https://neighborhub-api.onrender.com`
4. Deploy — Vercel auto-detects `vercel.json` for SPA routing

### Final step — update CORS

After Vercel assigns your frontend URL, go back to Render and set:

```
CLIENT_URL = https://your-app.vercel.app
```

Then trigger a manual redeploy on Render.

---

## Project Structure

```
neighborhub/
├── src/
│   ├── pages/          # One component per route
│   ├── components/     # Navbar, Footer, ProtectedRoute, ListingCard
│   ├── context/        # AuthContext (global auth state)
│   ├── services/       # Axios API wrappers by domain
│   └── utils/          # Constants, formatPrice()
├── server/
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # Express route definitions
│   │   ├── middleware/   # Auth, admin, upload, error handler
│   │   └── config/       # MySQL connection pool
│   └── server.js         # Entry point
├── database/           # SQL setup files
├── vercel.json         # SPA routing config for Vercel
└── server/render.yaml  # Render deployment config
```

---

## API Health Check

```
GET /api/health
→ { "status": "ok", "timestamp": "..." }
```
