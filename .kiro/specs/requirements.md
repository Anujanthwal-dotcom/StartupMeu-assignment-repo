# Expense Tracker — Requirements

## Overview
A full-stack personal expense tracking application built on the MERN stack. Users can log, categorize, and review their expenses with a monthly summary dashboard.

---

## Functional Requirements

### Authentication
- REQ-AUTH-01: Users can register with a name, email, and password
- REQ-AUTH-02: Passwords are hashed using bcrypt before storage
- REQ-AUTH-03: Users authenticate via email/password and receive a JWT
- REQ-AUTH-04: JWT is sent in the Authorization header (Bearer token)
- REQ-AUTH-05: Protected routes reject requests without a valid JWT

### Expenses
- REQ-EXP-01: Authenticated users can create an expense with a title, amount, category, date, and optional note
- REQ-EXP-02: Users can view a paginated list of their own expenses, sorted by date descending
- REQ-EXP-03: Users can update any field of an expense they own
- REQ-EXP-04: Users can delete an expense they own
- REQ-EXP-05: Users can filter expenses by category, date range, and minimum/maximum amount
- REQ-EXP-06: A user can only access their own expenses; other users' data is never exposed

### Categories
- REQ-CAT-01: Each expense must belong to one of the predefined categories: Food, Transport, Housing, Health, Entertainment, Shopping, Education, Other
- REQ-CAT-02: Category list is fixed in v1; no user-defined categories

### Dashboard / Summary
- REQ-DASH-01: The dashboard shows total spending for the current month
- REQ-DASH-02: The dashboard shows a breakdown of spending by category for the current month
- REQ-DASH-03: The dashboard shows the last 5 expenses
- REQ-DASH-04: Users can switch the summary view between current month, last 3 months, and last 6 months

---

## Non-Functional Requirements

- NFR-01: All API responses follow `{ success: boolean, message: string, data?: any }`
- NFR-02: Input is validated server-side using express-validator
- NFR-03: Database is MongoDB Atlas (Mongoose ORM only)
- NFR-04: Frontend components stay under 150 lines each
- NFR-05: Application is responsive on tablet (768px+) and desktop (1024px+)
- NFR-06: JWT secret and MongoDB URI are stored in environment variables; never committed

---

## Out of Scope (v1)
- Multiple currencies or currency conversion
- Recurring / scheduled expenses
- Budget limits and alerts
- Export to CSV or PDF
- Mobile-first design (< 768px)
- Shared expenses between users
