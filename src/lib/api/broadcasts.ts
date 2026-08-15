import { apiFetch } from './client';

export interface Broadcast {
  id: string;
  session_id: string;
  session_name?: string;
  message: string;
  total: number;
  sent: number;
  failed: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  created_at: string;
}

export async function listBroadcasts(): Promise<{ broadcasts: Broadcast[] }> {
  return apiFetch('/broadcasts');
}

export async function createBroadcast(sessionId: string, message: string, recipients: string[]): Promise<{ broadcast: Broadcast }> {
  return apiFetch('/broadcasts', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message, recipients }),
  });
}

export async function cancelBroadcast(id: string): Promise<{ ok: boolean }> {
  return apiFetch(`/broadcasts/${id}`, { method: 'DELETE' });
}
