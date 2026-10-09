import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const payload = await authService.register(name, email, password);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: payload,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const payload = await authService.login(email, password);
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: payload,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Protected: req.user is attached by the auth middleware
 */
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getMe(req.user!._id.toString());
    res.status(200).json({
      success: true,
      message: 'User profile fetched',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}
