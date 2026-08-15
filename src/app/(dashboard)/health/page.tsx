'use client';

import { useEffect, useState } from 'react';
import { getSystemHealth } from '@/lib/api/health';
import { Card, ErrorBox, PageHeader, Spinner, StatCard } from '@/components/ui';

export default function HealthPage() {
  const [health, setHealth] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    setError('');
    try {
      setHealth(await getSystemHealth());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (error && !health) return <ErrorBox message={error} />;
  if (!health) return <Spinner label="Checking system health…" />;

  const db = health.database as { ok: boolean; latencyMs: number };
  const redis = health.redis as { ok: boolean; latencyMs: number };
  const mem = health.memory as { heapUsedMb: number; heapTotalMb: number; systemFreeMb: number; systemTotalMb: number };

  return (
    <div>
      <PageHeader
        title="System Health"
        subtitle={`${health.status} · uptime ${Math.floor((health.uptime as number) / 60)}m · Node ${health.node}`}
        action={
          <button className="btn-secondary" onClick={() => void load()} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        }
      />

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Status" value={<span className={health.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}>{health.status}</span>} />
        <StatCard label="Database" value={db.ok ? 'Connected' : 'Down'} sub={`${db.latencyMs}ms`} />
        <StatCard label="Redis" value={redis.ok ? 'Connected' : 'Down'} sub={`${redis.latencyMs}ms`} />
        <StatCard label="WhatsApp sessions" value={health.whatsappSessions as number} />
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-sm font-semibold text-white">Memory</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-slate-400">Heap used</dt><dd className="font-medium text-white">{mem.heapUsedMb} MB / {mem.heapTotalMb} MB</dd></div>
          <div><dt className="text-slate-400">System free</dt><dd className="font-medium text-white">{mem.systemFreeMb} MB / {mem.systemTotalMb} MB</dd></div>
          <div><dt className="text-slate-400">Platform</dt><dd className="font-medium text-white">{health.platform}</dd></div>
        </dl>
      </Card>
    </div>
  );
}
