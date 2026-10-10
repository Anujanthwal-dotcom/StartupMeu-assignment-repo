import { useState } from 'react';
import type { FormEvent } from 'react';
import { EXPENSE_CATEGORIES } from '../services/expenses';
import type { IExpense, CreateExpenseInput, ExpenseCategory } from '../services/expenses';

interface Props {
  initial?: IExpense;
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
  onCancel: () => void;
}

export default function ExpenseForm({ initial, onSubmit, onCancel }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [category, setCategory] = useState<ExpenseCategory>(
    initial?.category ?? 'Other'
  );
  const [date, setDate] = useState(
    initial ? initial.date.slice(0, 10) : today
  );
  const [note, setNote] = useState(initial?.note ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        title,
        amount: parseFloat(amount),
        category,
        date,
        note: note.trim() || undefined,
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="ef-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="ef-title"
          type="text"
          required
          minLength={2}
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
          placeholder="e.g. Grocery run"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ef-amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹)
          </label>
          <input
            id="ef-amount"
            type="number"
            required
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputCls}
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="ef-date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="ef-date"
            type="date"
            required
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="ef-category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="ef-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          className={inputCls}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ef-note" className="block text-sm font-medium text-gray-700 mb-1">
          Note <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="ef-note"
          rows={2}
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputCls}
          placeholder="Any extra details…"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg py-2 text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
        >
          {loading ? 'Saving…' : initial ? 'Update' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}
