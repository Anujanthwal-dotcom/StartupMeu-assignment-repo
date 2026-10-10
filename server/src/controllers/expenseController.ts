import { Request, Response, NextFunction } from 'express';
import * as expenseService from '../services/expenseService';
import { ExpenseCategory } from '../models/Expense';

/**
 * GET /api/expenses
 * Query: page, limit, category, startDate, endDate, minAmount, maxAmount
 */
export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const { page, limit, category, startDate, endDate, minAmount, maxAmount } = req.query;

    const result = await expenseService.listExpenses(
      userId,
      {
        category: category as ExpenseCategory | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        minAmount: minAmount !== undefined ? Number(minAmount) : undefined,
        maxAmount: maxAmount !== undefined ? Number(maxAmount) : undefined,
      },
      {
        page: page !== undefined ? Number(page) : undefined,
        limit: limit !== undefined ? Number(limit) : undefined,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Expenses fetched',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/expenses
 * Body: { title, amount, category, date, note? }
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const { title, amount, category, date, note } = req.body;

    const expense = await expenseService.createExpense(userId, {
      title,
      amount: Number(amount),
      category,
      date,
      note,
    });

    res.status(201).json({
      success: true,
      message: 'Expense created',
      data: { expense },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/expenses/summary
 * Query: period (1m | 3m | 6m)
 */
export async function summary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const period = (req.query.period as '1m' | '3m' | '6m') ?? '1m';

    const data = await expenseService.getSummary(userId, period);

    res.status(200).json({
      success: true,
      message: 'Summary fetched',
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/expenses/:id
 */
export async function getOne(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const expense = await expenseService.getExpenseById(
      req.user!._id.toString(),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Expense fetched',
      data: { expense },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/expenses/:id
 * Body: partial { title, amount, category, date, note }
 */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title, amount, category, date, note } = req.body;
    const expense = await expenseService.updateExpense(
      req.user!._id.toString(),
      req.params.id as string,
      {
        ...(title !== undefined && { title }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(category !== undefined && { category }),
        ...(date !== undefined && { date }),
        ...(note !== undefined && { note }),
      }
    );
    res.status(200).json({
      success: true,
      message: 'Expense updated',
      data: { expense },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/expenses/:id
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await expenseService.deleteExpense(req.user!._id.toString(), req.params.id as string);
    res.status(200).json({
      success: true,
      message: 'Expense deleted',
    });
  } catch (err) {
    next(err);
  }
}
