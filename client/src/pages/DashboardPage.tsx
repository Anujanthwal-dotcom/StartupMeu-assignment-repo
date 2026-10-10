import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchSummary } from '../services/expenses';
import type { ExpenseSummary, ExpenseCategory } from '../services/expenses';
import CategoryBadge from '../components/CategoryBadge';

type Period = '1m' | '3m' | '6m';

const PERIOD_LABELS: Record<Period, string> = {
  '1m': 'This month',
  '3m': 'Last 3 months',
  '6m': 'Last 6 months',
};

const CHART_COLORS = [
  '#3b82f6', '#f97316', '#8b5cf6', '#22c55e',
  '#ec4899', '#eab308', '#6366f1', '#94a3b8',
];

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

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('1m');
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchSummary(period)
      .then(setSummary)
      .catch(() => setError('Failed to load summary'))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {!summary && loading ? (
        // Only show skeletons on the very first load (no data yet)
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : summary ? (
        <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-blue-600 text-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-blue-200 font-medium">Total spending</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(summary.totalAmount)}
              </p>
              <p className="text-sm text-blue-200 mt-1">{PERIOD_LABELS[period]}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {summary.byCategory.length}
              </p>
              <p className="text-sm text-gray-400 mt-1">with spending</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Top category</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.byCategory[0]?.category ?? '—'}
              </p>
              {summary.byCategory[0] && (
                <p className="text-sm text-gray-400 mt-1">
                  {formatCurrency(summary.byCategory[0].total)}
                </p>
              )}
            </div>
          </div>

          {/* Pie chart + breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie chart */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Spending by category</h2>
              {summary.byCategory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No data for this period</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={summary.byCategory}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {summary.byCategory.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                    <Legend formatter={(val) => val} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category breakdown list */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Breakdown</h2>
              {summary.byCategory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No data for this period</p>
              ) : (
                <ul className="space-y-3">
                  {summary.byCategory.map((c, idx) => {
                    const pct = summary.totalAmount > 0
                      ? Math.round((c.total / summary.totalAmount) * 100)
                      : 0;
                    return (
                      <li key={c.category}>
                        <div className="flex items-center justify-between mb-1">
                          <CategoryBadge category={c.category as ExpenseCategory} />
                          <span className="text-sm font-medium text-gray-700">
                            {formatCurrency(c.total)}{' '}
                            <span className="text-gray-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Recent expenses */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent expenses</h2>
            {summary.recentExpenses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No expenses yet — add one on the Expenses page.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {summary.recentExpenses.map((e) => (
                  <li key={e._id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryBadge category={e.category as ExpenseCategory} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                        <p className="text-xs text-gray-400">{formatDate(e.date)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 ml-4 shrink-0">
                      {formatCurrency(e.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
