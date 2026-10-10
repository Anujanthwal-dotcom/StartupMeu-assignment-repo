import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { EXPENSE_CATEGORIES } from '../services/expenses';
import type { IExpense, ExpenseFilters, ExpenseCategory, CreateExpenseInput } from '../services/expenses';
import ExpenseCard from '../components/ExpenseCard';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';

export default function ExpensesPage() {
  // ── filters state ──────────────────────────────────────────────────────────
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const filters: ExpenseFilters = {
    ...(category && { category }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    page,
    limit: 20,
  };

  const { data, loading, error, addExpense, editExpense, removeExpense } =
    useExpenses(filters);

  // ── modal state ────────────────────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<IExpense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IExpense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── handlers ───────────────────────────────────────────────────────────────
  async function handleAdd(data: CreateExpenseInput) {
    await addExpense(data);
    setShowAdd(false);
  }

  async function handleEdit(data: CreateExpenseInput) {
    if (!editTarget) return;
    await editExpense(editTarget._id, data);
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await removeExpense(deleteTarget._id);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function clearFilters() {
    setCategory('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }

  const hasFilters = category || startDate || endDate;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add expense
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value as ExpenseCategory | ''); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium py-1.5"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">
            {hasFilters ? 'No expenses match your filters.' : 'No expenses yet — add one above.'}
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              Showing {data.items.length} of {data.total} expense{data.total !== 1 ? 's' : ''}
            </p>
            {data.items.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                onEdit={setEditTarget}
                onDelete={(id) => {
                  const found = data.items.find((e) => e._id === id);
                  if (found) setDeleteTarget(found);
                }}
              />
            ))}

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4 mt-2 border-t border-gray-100">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-sm text-gray-500 hover:text-blue-600 disabled:opacity-40 font-medium transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-sm text-gray-500 hover:text-blue-600 disabled:opacity-40 font-medium transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add expense" onClose={() => setShowAdd(false)}>
          <ExpenseForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <Modal title="Edit expense" onClose={() => setEditTarget(null)}>
          <ExpenseForm
            initial={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <Modal title="Delete expense" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">"{deleteTarget.title}"</span>? This
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg py-2 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
            >
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
