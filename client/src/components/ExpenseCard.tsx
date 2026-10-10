import CategoryBadge from './CategoryBadge';
import type { IExpense } from '../services/expenses';

interface Props {
  expense: IExpense;
  onEdit: (expense: IExpense) => void;
  onDelete: (id: string) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ExpenseCard({ expense, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5">
          <CategoryBadge category={expense.category} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{expense.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(expense.date)}</p>
          {expense.note && (
            <p className="text-xs text-gray-500 mt-1 italic truncate">{expense.note}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(expense.amount)}
        </span>
        <button
          onClick={() => onEdit(expense)}
          aria-label={`Edit ${expense.title}`}
          className="text-gray-400 hover:text-blue-600 transition-colors text-xs font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(expense._id)}
          aria-label={`Delete ${expense.title}`}
          className="text-gray-400 hover:text-red-500 transition-colors text-xs font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
