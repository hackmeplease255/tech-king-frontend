'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardStats, type DashboardStats } from '@/lib/api/health';
import { listSessions, type Session } from '@/lib/api/sessions';
import { onEvent } from '@/lib/socket';
import { Card, EmptyState, PageHeader, Spinner, StatCard, StatusBadge } from '@/components/ui';

const SESSION_EVENTS = ['session.connected', 'session.reconnecting', 'session.disconnected', 'session.pairing', 'session.updated'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const [s, sess] = await Promise.all([getDashboardStats(), listSessions()]);
        if (!mounted) return;
        setStats(s);
        setSessions(sess.sessions);
      } catch (err) {
        if (mounted) setError((err as Error).message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Live updates — no page refresh needed
  useEffect(() => {
    const unsubs = SESSION_EVENTS.map((event) =>
      onEvent<{ sessionId: string; status?: string }>(event, ({ sessionId, status }) => {
        setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: status ?? s.status } : s)));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  if (error) return <Card className="text-red-400">{error}</Card>;
  if (!stats) return <Spinner label="Loading dashboard…" />;

  const connected = stats.sessions.connected;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live data from the Tech King backend — no mock numbers." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="WhatsApp sessions" value={connected} sub={`${stats.sessions.total} total · ${stats.sessions.disconnected} down`} />
        <StatCard label="Messages today" value={stats.messagesToday.toLocaleString()} />
        <StatCard label="Commands" value={stats.commandsToday.toLocaleString()} />
        <StatCard label="Customers" value={stats.customers.toLocaleString()} />
        <StatCard label="Active jobs" value={stats.jobs.active} />
        <StatCard label="System health" value={stats.health.status} sub={`${Math.round(stats.health.uptime / 60)}m uptime`} />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">WhatsApp Sessions</h2>
          <Link href="/sessions" className="text-sm text-brand-500 hover:underline">
            Manage →
          </Link>
        </div>
        {sessions.length === 0 ? (
          <EmptyState title="No sessions yet" hint="Create a session and pair WhatsApp from the Sessions page." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((s) => (
              <Link key={s.id} href={`/sessions/${s.id}`} className="card hover:border-slate-600">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{s.name}</p>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{s.phone ? `+${s.phone}` : 'Not paired yet'}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {s.last_seen_at ? `Last seen ${new Date(s.last_seen_at).toLocaleString()}` : '—'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
