import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AppError } from '../utils/AppError';

const BCRYPT_ROUNDS = 12;

// Shape returned to callers — never includes the password
export interface AuthPayload {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT_SECRET is not configured', 500);

  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  } as jwt.SignOptions);
}

function sanitizeUser(user: IUser): AuthPayload['user'] {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

// ─── register ───────────────────────────────────────────────────────────────

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthPayload> {
  // REQ-AUTH-01: check for duplicate email
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with that email already exists', 409);
  }

  // REQ-AUTH-02: hash password before storage
  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({ name, email, password: hashed });

  const token = signToken(user._id.toString());

  return { token, user: sanitizeUser(user) };
}

// ─── login ──────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<AuthPayload> {
  // REQ-AUTH-03: look up user and explicitly select password (select:false by default)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    // Use the same message for both "not found" and "wrong password"
    // to avoid leaking whether the email exists
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id.toString());

  return { token, user: sanitizeUser(user) };
}

// ─── getMe ──────────────────────────────────────────────────────────────────

export async function getMe(userId: string): Promise<AuthPayload['user']> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return sanitizeUser(user);
}
