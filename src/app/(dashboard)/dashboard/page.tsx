'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bot, MessageSquare, Activity, TrendingUp, PlayCircle, Users, Sparkles } from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '@/lib/api/health';
import { listSessions, type Session } from '@/lib/api/sessions';
import { onEvent } from '@/lib/socket';
import { useAuth } from '@/lib/auth-context';
import { Card, EmptyState, ErrorBox, Spinner, StatusBadge } from '@/components/ui';

const SESSION_EVENTS = ['session.connected', 'session.reconnecting', 'session.disconnected', 'session.pairing', 'session.updated'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

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

  useEffect(() => {
    const unsubs = SESSION_EVENTS.map((event) =>
      onEvent<{ sessionId: string; status?: string }>(event, ({ sessionId, status }) => {
        setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: status ?? s.status } : s)));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!stats) return <Spinner label="Loading dashboard…" />;

  const statCards = [
    { label: 'Active bots', value: String(stats.sessions.connected), delta: `${stats.sessions.total} total · ${stats.sessions.disconnected} down`, icon: Bot },
    { label: 'Messages sent', value: stats.messagesToday.toLocaleString(), delta: 'Today', icon: MessageSquare },
    { label: 'Uptime', value: '99.9%', delta: `${Math.round(stats.health.uptime / 60)}m uptime`, icon: Activity },
    { label: 'Customers', value: stats.customers.toLocaleString(), delta: 'All time', icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <section className="glass-panel relative overflow-hidden rounded-3xl p-7">
        <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">Dashboard</h1>
            <p className="label-caps mt-2 text-muted-foreground">Your central automation command hub</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-surface-2/80 px-4 py-3">
            <div className="neon-fill grid size-9 place-items-center rounded-xl font-display font-bold">K</div>
            <div>
              <p className="label-caps text-muted-foreground">Welcome back</p>
              <p className="font-display font-bold text-foreground">{(user?.name ?? 'KING HUB').toUpperCase()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="glass-panel rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <span className="label-caps text-muted-foreground">{s.label}</span>
              <s.icon className="size-4 text-primary" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-foreground">{s.value}</p>
            <p className="mt-1 text-xs text-success">{s.delta}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Deployments = WhatsApp sessions */}
        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">Deployments</h2>
            <Link href="/sessions" className="label-caps neon-text hover:underline">Manage →</Link>
          </div>
          {sessions.length === 0 ? (
            <div className="mt-5">
              <EmptyState title="No sessions yet" hint="Connect your first WhatsApp device to deploy" />
            </div>
          ) : (
            <ul className="mt-5 flex flex-col gap-3">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2/70 px-4 py-3.5">
                  <div>
                    <p className="font-medium text-foreground">{s.name}</p>
                    <p className="label-caps mt-1 text-muted-foreground">
                      {s.phone ? `WhatsApp · +${s.phone}` : 'Not paired yet'}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-5">
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Sparkles className="size-5" />
              </div>
              <span className="label-caps text-primary">Quick actions</span>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">Connect your first device</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pair WhatsApp with a pairing code, then keep your 64-char credential secret.
            </p>
            <Link
              href="/pair"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-primary transition-colors hover:bg-primary/20"
            >
              <span className="label-caps">Connect Device</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </section>

          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary">
                <PlayCircle className="size-5" />
              </div>
              <span className="label-caps text-primary">Broadcasts</span>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">
              {stats.broadcasts.running > 0 ? `${stats.broadcasts.running} broadcast(s) running` : 'Reach your customers'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Send one message to many recipients with live progress over WebSocket.
            </p>
            <Link
              href="/broadcasts"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-5 py-2.5 text-success transition-colors hover:bg-success/20"
            >
              <span className="label-caps">Open Broadcasts</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </section>

          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Users className="size-5" />
              </div>
              <span className="label-caps text-primary">Automations</span>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">Automate on autopilot</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Interval and keyword-triggered messages, running on the VPS.
            </p>
            <Link
              href="/automations"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-5 py-2.5 text-warning transition-colors hover:bg-warning/20"
            >
              <span className="label-caps">Open Automations</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
