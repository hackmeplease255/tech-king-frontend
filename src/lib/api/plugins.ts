import { apiFetch } from './client';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled_default: boolean;
}

export async function listPlugins(): Promise<{ plugins: Plugin[] }> {
  return apiFetch('/plugins');
}

export async function setPlugin(sessionId: string, pluginId: string, enabled: boolean): Promise<{ ok: boolean }> {
  return apiFetch(`/plugins/${pluginId}/${enabled ? 'enable' : 'disable'}`, {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  });
}

export async function configurePlugin(sessionId: string, pluginId: string, config: Record<string, unknown>): Promise<{ ok: boolean }> {
  return apiFetch(`/plugins/${pluginId}`, {
    method: 'PATCH',
    body: JSON.stringify({ sessionId, config }),
  });
}
