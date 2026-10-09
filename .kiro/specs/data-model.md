# Expense Tracker — Data Model

## MongoDB Collections

### users

```typescript
{
  _id: ObjectId,
  name: string,               // required, 2–50 chars
  email: string,              // required, unique, lowercase
  password: string,           // bcrypt hash, never returned in API responses
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:
- `email` — unique

---

### expenses

```typescript
{
  _id: ObjectId,
  user: ObjectId,             // ref: User — required, owner of the expense
  title: string,              // required, 2–100 chars
  amount: number,             // required, positive, up to 2 decimal places
  category: string,           // required, one of the predefined enum values
  date: Date,                 // required, the date the expense occurred
  note: string,               // optional, max 500 chars
  createdAt: Date,
  updatedAt: Date
}
```

Category enum values:
`Food | Transport | Housing | Health | Entertainment | Shopping | Education | Other`

Indexes:
- `user` — for filtering all expenses by owner
- `user + date` — compound, for date-range queries per user
- `user + category` — compound, for category breakdown queries per user

---

## Mongoose Schema Notes

### Embedding vs Referencing

| Entity | Strategy | Reason |
|---|---|---|
| User | Separate collection | Authentication entity; referenced by expenses |
| Expense | Separate collection | Core entity; needs independent CRUD and filtering queries |

Expenses are kept as a separate collection (not embedded in User) because:
- The list can grow unboundedly
- Expenses need to be queried, filtered, sorted, and paginated independently
- Aggregation pipelines for summaries work cleanly on a flat collection

---

## API Response Types (TypeScript interfaces)

```typescript
// Auth
interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Expense
interface IExpense {
  _id: string;
  user: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;           // ISO date string
  note?: string;
  createdAt: string;
  updatedAt: string;
}

type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Housing'
  | 'Health'
  | 'Entertainment'
  | 'Shopping'
  | 'Education'
  | 'Other';

// Dashboard summary
interface ISummary {
  totalAmount: number;
  byCategory: { category: ExpenseCategory; total: number }[];
  recentExpenses: IExpense[];
}

// Standard API envelope
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// Paginated list wrapper
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
```

---

## Validation Rules

### User
| Field | Rule |
|---|---|
| name | required, string, 2–50 chars |
| email | required, valid email format, unique |
| password | required, min 8 chars, at least one number |

### Expense
| Field | Rule |
|---|---|
| title | required, string, 2–100 chars |
| amount | required, number, > 0, max 2 decimal places |
| category | required, must be one of the predefined enum values |
| date | required, valid ISO date, not in the future |
| note | optional, max 500 chars |
