import { apiFetch } from './client';

export interface DashboardStats {
  messagesToday: number;
  commandsToday: number;
  customers: number;
  sessions: { total: number; connected: number; disconnected: number };
  jobs: { active: number; failed: number };
  broadcasts: { total: number; running: number };
  health: { status: string; uptime: number; cpu: number; memory: number };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch('/metrics/dashboard');
}

export async function getSystemHealth(): Promise<Record<string, unknown>> {
  return apiFetch('/metrics/health');
}
