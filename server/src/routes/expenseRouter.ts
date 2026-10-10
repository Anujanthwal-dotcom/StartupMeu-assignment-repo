import { Router } from 'express';
import { body, query } from 'express-validator';
import * as expenseController from '../controllers/expenseController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { EXPENSE_CATEGORIES } from '../models/Expense';

const router = Router();

// All expense routes require auth
router.use(protect);

// ─── Validation chains ────────────────────────────────────────────────────────

const expenseBodyValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .isIn(EXPENSE_CATEGORIES)
    .withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO date')
    .custom((val: string) => {
      if (new Date(val) > new Date()) throw new Error('Date cannot be in the future');
      return true;
    }),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must be at most 500 characters'),
];

const expenseUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .optional()
    .isIn(EXPENSE_CATEGORIES)
    .withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date')
    .custom((val: string) => {
      if (new Date(val) > new Date()) throw new Error('Date cannot be in the future');
      return true;
    }),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must be at most 500 characters'),
];

const summaryQueryValidation = [
  query('period')
    .optional()
    .isIn(['1m', '3m', '6m'])
    .withMessage('Period must be 1m, 3m, or 6m'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

// NOTE: /summary must come BEFORE /:id so Express doesn't match "summary" as an id
router.get('/summary', summaryQueryValidation, validate, expenseController.summary);

router.get('/', expenseController.list);
router.post('/', expenseBodyValidation, validate, expenseController.create);

router.get('/:id', expenseController.getOne);
router.put('/:id', expenseUpdateValidation, validate, expenseController.update);
router.delete('/:id', expenseController.remove);

export default router;
