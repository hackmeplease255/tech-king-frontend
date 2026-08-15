import { apiFetch } from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  language: 'en' | 'sw';
  phone: string | null;
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function register(name: string, email: string, password: string, language: 'en' | 'sw'): Promise<{ token: string; user: User }> {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, language }) });
}

export async function me(): Promise<{ user: User }> {
  return apiFetch('/auth/me');
}

export async function updateMe(payload: Record<string, unknown>): Promise<{ user: User }> {
  return apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) });
}
