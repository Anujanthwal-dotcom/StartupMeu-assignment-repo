# Expense Tracker

A full-stack personal expense tracking application built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript. Users can register, log in, and manage their expenses with category breakdowns, spending summaries, and visual charts — all in a clean, responsive UI.

---

## Features

- JWT-based user authentication (register, login, protected routes)
- Create, read, update, and delete expenses
- Filter and paginate expenses by category and date
- Spending summary with category breakdown and percentage share
- Pie chart visualisation of spending by category
- Period selector — view summaries for 1 month, 3 months, or 6 months
- Smooth tab transitions (no flash on period switch)
- Fully responsive layout with Tailwind CSS

---

## Technologies Used

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (jsonwebtoken), bcrypt |
| Validation | express-validator |

---

## Project Structure

```
/
├── README.md
├── client/       # React 18 + Vite + TypeScript frontend
└── server/       # Express + TypeScript REST API
```

---

## Setup and Installation

### Prerequisites

- Node.js 18+
- npm 9+
- A MongoDB Atlas connection string

### 1. Clone the repo

```bash
git clone <repo-url>
cd expense-tracker
```

### 2. Set up the server

```bash
cd server
cp .env.example .env    # fill in your values
npm install
```

### 3. Set up the client

```bash
cd client
npm install
```

### Environment Variables

Copy `server/.env.example` to `server/.env` and fill in the following:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Port to run the server on (default: 5000) |

---

## How to Run

### Development

Run the server and client in separate terminals:

```bash
# Terminal 1 — server
cd server
npm run dev        # starts on http://localhost:5000

# Terminal 2 — client
cd client
npm run dev        # starts on http://localhost:5173
```

### Production

```bash
# Build the server
cd server
npm run build
npm start

# Build the client
cd client
npm run build      # outputs to client/dist
```

---

## API Overview

Base URL: `/api`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register a new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/expenses | Yes | List expenses (paginated, filterable) |
| POST | /api/expenses | Yes | Create an expense |
| GET | /api/expenses/:id | Yes | Get a single expense |
| PUT | /api/expenses/:id | Yes | Update an expense |
| DELETE | /api/expenses/:id | Yes | Delete an expense |
| GET | /api/expenses/summary | Yes | Spending summary by category |

---

## AI Tool Used

This project was built using **Kiro** (by AWS).

### AI Development Experience

Kiro was used throughout the entire development process — not just for boilerplate, but as an active development partner for architecture decisions, debugging, and UI refinement.

### Specific tasks where Kiro was used

1. **Component development** — Built the `DashboardPage` component including the period selector, summary cards, pie chart integration with Recharts, category breakdown list with progress bars, and the recent expenses list. Also built `CategoryBadge`, `ExpenseForm`, `ExpenseCard`, and `Modal` components.

2. **API creation** — Scaffolded the full REST API including auth routes (`/register`, `/login`, `/me`) and expense routes (CRUD + summary endpoint) with JWT middleware, input validation via `express-validator`, and Mongoose models.

3. **Debugging** — Diagnosed a `ts-node` crash caused by incompatibility between `ts-node@10` and TypeScript 7+ on Node.js v26. Identified the root cause (`ts.sys` being undefined during config resolution) and replaced `ts-node` with `tsx` as a drop-in fix.

4. **Refactoring** — Fixed a UI flash issue on the dashboard where switching period tabs caused skeleton loaders to flash. Refactored the loading state logic so skeletons only appear on initial load; subsequent fetches keep the old data visible with a smooth opacity transition.

5. **Database integration** — Set up Mongoose schemas for `User` and `Expense` models, including the summary aggregation pipeline that groups expenses by category, calculates totals, and returns recent expenses — all filtered by user and date range.

---

## Troubleshooting & Known Issues

| # | Issue | Fix |
|---|-------|-----|
| 1 | `ts-node` crashes with `Cannot read properties of undefined (reading 'fileExists')` on Node.js v26 + TypeScript 7 | `ts-node@10` doesn't support TypeScript 7+. Replaced `ts-node` with `tsx` and updated the `dev` script accordingly. |
| 2 | Dashboard flashes skeleton loaders when switching between period tabs | Skeletons now only show on initial load. On period switches, old data stays visible and fades to 50% opacity while new data loads. |
