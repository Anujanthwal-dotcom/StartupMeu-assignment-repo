import { Types } from 'mongoose';
import Expense, { IExpense, ExpenseCategory } from '../models/Expense';
import { AppError } from '../utils/AppError';

// ─── Query filter types ───────────────────────────────────────────────────────

export interface ExpenseFilters {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedExpenses {
  items: IExpense[];
  total: number;
  page: number;
  totalPages: number;
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

// ─── helpers ─────────────────────────────────────────────────────────────────

function buildDateFilter(period: '1m' | '3m' | '6m'): Date {
  const months = period === '1m' ? 1 : period === '3m' ? 3 : 6;
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  since.setHours(0, 0, 0, 0);
  return since;
}

// ─── list (paginated + filtered) ─────────────────────────────────────────────

export async function listExpenses(
  userId: string,
  filters: ExpenseFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedExpenses> {
  const page = Math.max(1, pagination.page ?? 1);
  const limit = Math.min(100, Math.max(1, pagination.limit ?? 20));
  const skip = (page - 1) * limit;

  // Build MongoDB filter — always scoped to the user (REQ-EXP-06)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = { user: userId };

  if (filters.category) query.category = filters.category;

  if (filters.startDate ?? filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    query.amount = {};
    if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
    if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
  }

  const [items, total] = await Promise.all([
    Expense.find(query).sort({ date: -1 }).skip(skip).limit(limit),
    Expense.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── create ──────────────────────────────────────────────────────────────────

export async function createExpense(
  userId: string,
  data: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    note?: string;
  }
): Promise<IExpense> {
  const expense = await Expense.create({ ...data, user: userId });
  return expense;
}

// ─── getOne ──────────────────────────────────────────────────────────────────

export async function getExpenseById(
  userId: string,
  expenseId: string
): Promise<IExpense> {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }
  return expense;
}

// ─── update ──────────────────────────────────────────────────────────────────

export async function updateExpense(
  userId: string,
  expenseId: string,
  data: Partial<{
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    note: string;
  }>
): Promise<IExpense> {
  const expense = await Expense.findOneAndUpdate(
    { _id: expenseId, user: userId },
    data,
    { new: true, runValidators: true }
  );
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }
  return expense;
}

// ─── delete ──────────────────────────────────────────────────────────────────

export async function deleteExpense(
  userId: string,
  expenseId: string
): Promise<void> {
  const result = await Expense.findOneAndDelete({ _id: expenseId, user: userId });
  if (!result) {
    throw new AppError('Expense not found', 404);
  }
}

// ─── summary (aggregation) ────────────────────────────────────────────────────

export async function getSummary(
  userId: string,
  period: '1m' | '3m' | '6m' = '1m'
): Promise<ExpenseSummary> {
  const since = buildDateFilter(period);

  const matchStage = { user: { $eq: new Types.ObjectId(userId) }, date: { $gte: since } };

  const [aggResult, recentExpenses] = await Promise.all([
    Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]),
    Expense.find({ user: userId, date: { $gte: since } })
      .sort({ date: -1 })
      .limit(5),
  ]);

  const byCategory: CategoryTotal[] = aggResult.map((r) => ({
    category: r._id as ExpenseCategory,
    total: Math.round(r.total * 100) / 100,
  }));

  const totalAmount = Math.round(
    byCategory.reduce((sum, c) => sum + c.total, 0) * 100
  ) / 100;

  return { totalAmount, byCategory, recentExpenses };
}
