import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Reads the results of express-validator chains and short-circuits
 * the request with 422 if any field failed validation.
 * Place this AFTER your validation chain arrays in the route.
 *
 * Example:
 *   router.post('/login', loginValidation, validate, authController.login)
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: errors
        .array()
        .map((e) => e.msg)
        .join(', '),
    });
    return;
  }
  next();
}
