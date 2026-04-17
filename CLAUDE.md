# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NeighborHub** — a local community marketplace for buying/selling items and services. Users can post listings, message each other, place orders, leave reviews, and manage their profiles. An admin dashboard provides platform oversight.

## Commands

```bash
# Development (frontend on :5173, proxies /api to :5000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

There is no test framework configured.

To run the full app, the Express backend must also be running on port 5000 (see `server/`). The backend requires a `.env` with MySQL (Railway) credentials.

## Architecture

**Stack:** React 19 + Vite, Tailwind CSS, Axios, React Router DOM 7, React Hot Toast, Lucide React icons. Backend: Express.js + MySQL (separate `server/` directory).

**State management:** Single `AuthContext` (`src/context/AuthContext.jsx`) holds auth state (user, token). All other state is local per page. JWT is stored in `localStorage` as `nh_token` and `nh_user`.

**API layer:** `src/services/api.js` creates an Axios instance. An interceptor attaches the JWT to every request; 401 responses auto-logout the user. The Vite dev server proxies `/api` → `http://localhost:5000`. In production, `VITE_API_URL` env var is used. Service modules (`authService`, `listingService`, `messageService`, `orderService`) wrap specific endpoint groups.

**Routing** (`src/App.jsx`): Public routes include `/`, `/listings`, `/listings/:id`, `/login`, `/register`, `/profile/:id`. Protected routes (wrapped by `ProtectedRoute`) include `/create-listing`, `/listings/:id/edit`, `/messages`, `/orders`, `/admin`, `/profile`, `/edit-profile`.

**Real-time:** Polling-based — messages poll every 5s, notifications every 30s. No WebSockets.

**Image uploads:** Multipart `FormData` sent to the backend; `api.js` handles content-type for these requests.

## Key Directories

| Path                       | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `src/pages/`               | One file per route — contains all page-level logic and state |
| `src/components/common/`   | `Navbar`, `Footer`, `ProtectedRoute`                         |
| `src/components/listings/` | `ListingCard` reusable card                                  |
| `src/context/`             | `AuthContext` — the only global state                        |
| `src/services/`            | Axios calls grouped by domain                                |
| `src/utils/constants.js`   | `CATEGORIES`, `PRICE_RANGES`, `formatPrice()`                |
| `server/`                  | Express backend (separate concern from this frontend)        |
| `database/`                | SQL setup files                                              |

## Tailwind Customization

Custom color tokens in `tailwind.config.js`:

- `primary` — blue shades
- `accent` — orange shades

Use these instead of raw Tailwind color utilities for brand-consistent UI.

## ESLint

Uses ESLint 9 flat config (`eslint.config.js`). Uppercase variable names (e.g., component imports) are exempt from the unused-vars rule. Run `npm run lint` before committing.

## Code Style Rules

- Use descriptive variable names
- Keep components focused — one responsibility per file
- Use the existing custom Tailwind tokens (`primary`, `accent`) not raw colors
- Follow existing patterns in nearby files before inventing new ones

## Important Rules

- NEVER hardcode credentials or API keys — use .env variables
- JWT is stored as `nh_token` and `nh_user` in localStorage — don't change these keys
- Always run `npm run lint` before finishing any task
- Test both frontend (:5173) and backend (:5000) are running before debugging API issues

## Current Status

- Phase 5 complete — authentication, listings CRUD, orders, messaging, reviews, notifications, and admin dashboard are all implemented.
- April 18, 2026 IT Elective 2 Task 3 deliverables are fully met (auth system + CRUD + BCrypt + JWT + validation).
- Known bugs: none currently identified.
- Next tasks: (add your to-do here)
