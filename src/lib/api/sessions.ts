import { apiFetch } from './client';

export interface Session {
  id: string;
  user_id: number | null;
  name: string;
  status: string;
  phone: string | null;
  pairing_code: string | null;
  credential_hint: string | null;
  credential_expires_at: string | null;
  credential_attached: boolean;
  plugins: Record<string, { enabled: boolean; config?: Record<string, unknown> }>;
  settings: Record<string, unknown>;
  last_seen_at: string | null;
  created_at: string;
}

export async function listSessions(): Promise<{ sessions: Session[] }> {
  return apiFetch('/sessions');
}

export async function createSession(name: string): Promise<{ session: Session }> {
  return apiFetch('/sessions', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function getSession(id: string): Promise<{ session: Session }> {
  return apiFetch(`/sessions/${id}`);
}

export async function pairSession(id: string, phone: string): Promise<{ pairingCode: string; instructions: string }> {
  return apiFetch(`/sessions/${id}/pair`, { method: 'POST', body: JSON.stringify({ phone }) });
}

export async function attachSession(credential: string): Promise<{ session: Session; message: string }> {
  return apiFetch('/sessions/attach', { method: 'POST', body: JSON.stringify({ credential }) });
}

export async function sessionAction(id: string, action: 'reconnect' | 'disconnect' | 'restart'): Promise<{ ok: boolean }> {
  return apiFetch(`/sessions/${id}/${action}`, { method: 'POST' });
}

export async function deleteSession(id: string): Promise<{ ok: boolean }> {
  return apiFetch(`/sessions/${id}`, { method: 'DELETE' });
}

export async function sendTestMessage(id: string, jid: string, text: string): Promise<{ ok: boolean }> {
  return apiFetch(`/sessions/${id}/send`, { method: 'POST', body: JSON.stringify({ jid, text }) });
}

export async function updateSession(id: string, payload: Record<string, unknown>): Promise<{ session: Session }> {
  return apiFetch(`/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}
