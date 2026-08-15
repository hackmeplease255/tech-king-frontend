'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { Card, EmptyState, ErrorBox, PageHeader, Spinner } from '@/components/ui';

interface LogRow {
  id: number;
  level: string;
  source: string | null;
  message: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

const LEVELS = ['', 'error', 'warn', 'info', 'debug'];

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch<{ logs: LogRow[] }>(`/logs?limit=100${level ? `&level=${level}` : ''}`)
      .then(({ logs }) => setLogs(logs))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [level]);

  const levelColor: Record<string, string> = {
    error: 'text-red-400',
    warn: 'text-amber-400',
    info: 'text-slate-300',
    debug: 'text-slate-500',
  };

  return (
    <div>
      <PageHeader title="Logs" subtitle="Recent backend events (ADMIN only)." />

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <div className="mb-4 max-w-xs">
        <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l === '' ? 'All levels' : l}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading logs…" />
      ) : logs.length === 0 ? (
        <EmptyState title="No logs" />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Level</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-slate-800/60">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-slate-500">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className={`px-4 py-2 font-medium ${levelColor[l.level] ?? 'text-slate-300'}`}>{l.level}</td>
                  <td className="px-4 py-2 text-slate-400">{l.source ?? '—'}</td>
                  <td className="max-w-md truncate px-4 py-2 text-slate-300">{l.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
