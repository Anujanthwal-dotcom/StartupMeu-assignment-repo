import { useState, useEffect, useCallback } from 'react';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/expenses';
import type {
  IExpense,
  PaginatedExpenses,
  ExpenseFilters,
  CreateExpenseInput,
} from '../services/expenses';

interface UseExpensesReturn {
  data: PaginatedExpenses | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  addExpense: (input: CreateExpenseInput) => Promise<void>;
  editExpense: (id: string, input: Partial<CreateExpenseInput>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
}

export function useExpenses(filters: ExpenseFilters = {}): UseExpensesReturn {
  const [data, setData] = useState<PaginatedExpenses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stringify filters so useEffect dependency comparison works correctly
  const filtersKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExpenses(JSON.parse(filtersKey) as ExpenseFilters);
      setData(result);
    } catch {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function addExpense(input: CreateExpenseInput): Promise<void> {
    await createExpense(input);
    await load();
  }

  async function editExpense(id: string, input: Partial<CreateExpenseInput>): Promise<void> {
    await updateExpense(id, input);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((e: IExpense) =>
          e._id === id ? { ...e, ...input } : e
        ),
      };
    });
  }

  async function removeExpense(id: string): Promise<void> {
    await deleteExpense(id);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((e: IExpense) => e._id !== id),
        total: prev.total - 1,
      };
    });
  }

  return { data, loading, error, refetch: load, addExpense, editExpense, removeExpense };
}
