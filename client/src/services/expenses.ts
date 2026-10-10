import api from './api';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Housing'
  | 'Health'
  | 'Entertainment'
  | 'Shopping'
  | 'Education'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food', 'Transport', 'Housing', 'Health',
  'Entertainment', 'Shopping', 'Education', 'Other',
];

export interface IExpense {
  _id: string;
  user: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedExpenses {
  items: IExpense[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ExpenseFilters {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface CategoryTotal {
  category: ExpenseCategory;
  total: number;
}

export interface ExpenseSummary {
  totalAmount: number;
  byCategory: CategoryTotal[];
  recentExpenses: IExpense[];
}

export type CreateExpenseInput = {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
};

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchExpenses(filters: ExpenseFilters = {}): Promise<PaginatedExpenses> {
  const res = await api.get<{ success: boolean; data: PaginatedExpenses }>('/expenses', {
    params: filters,
  });
  return res.data.data!;
}

export async function fetchSummary(period: '1m' | '3m' | '6m' = '1m'): Promise<ExpenseSummary> {
  const res = await api.get<{ success: boolean; data: ExpenseSummary }>('/expenses/summary', {
    params: { period },
  });
  return res.data.data!;
}

export async function createExpense(input: CreateExpenseInput): Promise<IExpense> {
  const res = await api.post<{ success: boolean; data: { expense: IExpense } }>('/expenses', input);
  return res.data.data!.expense;
}

export async function updateExpense(
  id: string,
  input: Partial<CreateExpenseInput>
): Promise<IExpense> {
  const res = await api.put<{ success: boolean; data: { expense: IExpense } }>(
    `/expenses/${id}`,
    input
  );
  return res.data.data!.expense;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}
