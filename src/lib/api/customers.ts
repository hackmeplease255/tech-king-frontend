import { apiFetch } from './client';

export interface Customer {
  id: number;
  session_id: string;
  session_name?: string;
  jid: string;
  phone: string | null;
  name: string | null;
  language: 'en' | 'sw';
  tags: string[];
  notes: string | null;
  last_interaction_at: string | null;
  created_at: string;
}

export async function listCustomers(search = '', limit = 50): Promise<{ customers: Customer[]; total: number }> {
  const q = new URLSearchParams({ search, limit: String(limit) });
  return apiFetch(`/customers?${q.toString()}`);
}

export async function getCustomer(id: string): Promise<{ customer: Customer }> {
  return apiFetch(`/customers/${id}`);
}

export async function updateCustomer(id: string, payload: Record<string, unknown>): Promise<{ customer: Customer }> {
  return apiFetch(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteCustomer(id: string): Promise<{ ok: boolean }> {
  return apiFetch(`/customers/${id}`, { method: 'DELETE' });
}
