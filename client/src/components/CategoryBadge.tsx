import type { ExpenseCategory } from '../services/expenses';

const COLORS: Record<ExpenseCategory, string> = {
  Food:          'bg-orange-100 text-orange-700',
  Transport:     'bg-blue-100 text-blue-700',
  Housing:       'bg-purple-100 text-purple-700',
  Health:        'bg-green-100 text-green-700',
  Entertainment: 'bg-pink-100 text-pink-700',
  Shopping:      'bg-yellow-100 text-yellow-700',
  Education:     'bg-indigo-100 text-indigo-700',
  Other:         'bg-gray-100 text-gray-600',
};

interface Props {
  category: ExpenseCategory;
  className?: string;
}

export default function CategoryBadge({ category, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[category]} ${className}`}
    >
      {category}
    </span>
  );
}
