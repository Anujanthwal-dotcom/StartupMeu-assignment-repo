import { Schema, model, Document, Types } from 'mongoose';

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
  'Food',
  'Transport',
  'Housing',
  'Health',
  'Entertainment',
  'Shopping',
  'Education',
  'Other',
];

// TypeScript interface for the Expense document
export interface IExpense extends Document {
  user: Types.ObjectId;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      // store with at most 2 decimal places
      set: (v: number) => Math.round(v * 100) / 100,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note must be at most 500 characters'],
      default: undefined,
    },
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  }
);

// Index: filter all expenses by owner
expenseSchema.index({ user: 1 });

// Compound index: date-range queries per user
expenseSchema.index({ user: 1, date: -1 });

// Compound index: category breakdown queries per user
expenseSchema.index({ user: 1, category: 1 });

const Expense = model<IExpense>('Expense', expenseSchema);

export default Expense;
