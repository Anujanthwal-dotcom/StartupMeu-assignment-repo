import api from './api';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthPayload> {
  const res = await api.post<{ success: boolean; data: AuthPayload }>('/auth/register', {
    name,
    email,
    password,
  });
  return res.data.data!;
}

export async function login(email: string, password: string): Promise<AuthPayload> {
  const res = await api.post<{ success: boolean; data: AuthPayload }>('/auth/login', {
    email,
    password,
  });
  return res.data.data!;
}

export async function getMe(): Promise<AuthUser> {
  const res = await api.get<{ success: boolean; data: { user: AuthUser } }>('/auth/me');
  return res.data.data!.user;
}
