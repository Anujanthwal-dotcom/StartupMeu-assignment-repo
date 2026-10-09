# Expense Tracker — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
│  React 18 + Vite + TypeScript                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  Auth Pages  │  │  Dashboard   │  │  Expenses Page        │ │
│  │  Login /     │  │  Summary +   │  │  List, Filter,        │ │
│  │  Register    │  │  Charts      │  │  Add / Edit / Delete  │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Context API (AuthContext)  │  React Router v6              ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Axios (REST)                                               ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server (Express + TS)                      │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐ │
│  │  Auth Router │  │  Expense Router                          │ │
│  │  /api/auth   │  │  /api/expenses                           │ │
│  └──────────────┘  └──────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Controllers  │  Middleware (auth, validate, errorHandler)  ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Mongoose Models: User, Expense                             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                         │ Mongoose
                         ▼
              ┌──────────────────────┐
              │    MongoDB Atlas     │
              │  (expense-tracker)   │
              └──────────────────────┘
```

---

## Technology Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Language | TypeScript (both ends) | Type safety, better IDE support, catches errors at compile time |
| Backend framework | Express.js | Minimal, well-understood, large ecosystem |
| Database | MongoDB + Mongoose | Flexible document model; aggregation pipeline fits summary queries well |
| Authentication | JWT (jsonwebtoken) | Stateless, works well with SPA clients |
| Password hashing | bcrypt | Industry standard, adaptive cost factor |
| Input validation | express-validator | Composable, integrates neatly with Express |
| Frontend bundler | Vite | Fast HMR, native ESM, low config |
| Routing | React Router v6 | Standard for React SPAs |
| Styling | Tailwind CSS | Utility-first, no CSS bundle bloat |
| HTTP client | Axios | Interceptors for auth headers, error normalization |
| Charts | Recharts | Simple React chart library, good pie/bar support |

---

## API Design

### Base URL
```
/api
```

### Standard Response Envelope
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... }
}
```

### Endpoints

#### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user profile |

#### Expenses
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/expenses | Yes | List expenses (paginated, filterable) |
| POST | /api/expenses | Yes | Create a new expense |
| GET | /api/expenses/:id | Yes | Get a single expense |
| PUT | /api/expenses/:id | Yes | Update an expense |
| DELETE | /api/expenses/:id | Yes | Delete an expense |
| GET | /api/expenses/summary | Yes | Get spending summary (totals + by category) |

#### Query Parameters for GET /api/expenses
| Param | Type | Description |
|---|---|---|
| page | number | Page number, default 1 |
| limit | number | Items per page, default 20 |
| category | string | Filter by category |
| startDate | ISO date | Filter expenses on or after this date |
| endDate | ISO date | Filter expenses on or before this date |
| minAmount | number | Filter by minimum amount |
| maxAmount | number | Filter by maximum amount |

#### Query Parameters for GET /api/expenses/summary
| Param | Type | Description |
|---|---|---|
| period | `1m` \| `3m` \| `6m` | Summary period, default `1m` |

---

## Folder Structure

```
/
├── README.md                 # Project overview and setup instructions
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI (ExpenseCard, CategoryBadge, Modal…)
│   │   ├── pages/            # Route-level pages (Login, Register, Dashboard, Expenses)
│   │   ├── context/          # AuthContext
│   │   ├── hooks/            # useAuth, useExpenses
│   │   ├── services/         # Axios API wrappers (auth.ts, expenses.ts)
│   │   └── main.tsx          # App entry
│   ├── package.json
│   └── vite.config.ts
└── server/                   # Express backend
    ├── src/
    │   ├── config/           # DB connection, env validation
    │   ├── models/           # Mongoose schemas: User, Expense
    │   ├── routes/           # Express routers (auth, expenses)
    │   ├── controllers/      # Route handler logic
    │   ├── middleware/       # auth, validate, errorHandler
    │   └── index.ts          # App entry point
    ├── package.json
    └── tsconfig.json
```

---

## Security Considerations

- JWT expiry: 7 days (configurable via env)
- Passwords: bcrypt cost factor 12
- Ownership check: every expense query scopes to `req.user._id`; users cannot access other users' data
- CORS: restrict origin to client URL in production
- Helmet: set security-related HTTP headers
- Rate limiting: not in v1 scope (add express-rate-limit before production)
- Environment secrets: never committed; `.env` is gitignored
