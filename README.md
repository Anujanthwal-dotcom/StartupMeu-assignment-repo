# Expense Tracker

A full-stack personal expense tracking application built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

## Project Structure

```
/
├── README.md
├── client/       # React 18 + Vite + TypeScript frontend
└── server/       # Express + TypeScript REST API
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (jsonwebtoken), bcrypt |
| Validation | express-validator |

## Getting Started

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
cp .env.example .env       # fill in your values
npm install
npm run dev                # starts on http://localhost:5000
```

### 3. Set up the client

```bash
cd client
npm install
npm run dev                # starts on http://localhost:5173
```

## Environment Variables

See `server/.env.example` for the full list of required variables.

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
