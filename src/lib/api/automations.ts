import { apiFetch } from './client';

export interface Automation {
  id: string;
  session_id: string;
  session_name?: string;
  name: string;
  trigger_type: 'interval' | 'keyword';
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  enabled: boolean;
  next_run_at: string | null;
  last_run_at: string | null;
}

export async function listAutomations(): Promise<{ automations: Automation[] }> {
  return apiFetch('/automations');
}

export async function createAutomation(payload: {
  sessionId: string;
  name: string;
  triggerType: 'interval' | 'keyword';
  triggerConfig: Record<string, unknown>;
  actionType: 'send_message';
  actionConfig: Record<string, unknown>;
}): Promise<{ automation: Automation }> {
  return apiFetch('/automations', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateAutomation(id: string, payload: Record<string, unknown>): Promise<{ automation: Automation }> {
  return apiFetch(`/automations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteAutomation(id: string): Promise<{ ok: boolean }> {
  return apiFetch(`/automations/${id}`, { method: 'DELETE' });
}
