'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { cancelBroadcast, createBroadcast, listBroadcasts, type Broadcast } from '@/lib/api/broadcasts';
import { listSessions, type Session } from '@/lib/api/sessions';
import { onEvent } from '@/lib/socket';
import { Card, EmptyState, ErrorBox, PageHeader, Spinner, StatusBadge } from '@/components/ui';

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [b, s] = await Promise.all([listBroadcasts(), listSessions()]);
        setBroadcasts(b.broadcasts);
        setSessions(s.sessions);
        if (s.sessions.length > 0) setSessionId(s.sessions[0].id);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Live progress — no refresh needed
  useEffect(() => {
    return onEvent<{ broadcastId: string; sent: number; failed: number; total: number; status?: Broadcast['status'] }>(
      'broadcast.progress',
      ({ broadcastId, sent, failed, total, status }) => {
        setBroadcasts((prev) =>
          prev.map((b) => (b.id === broadcastId ? { ...b, sent, failed, total, status: status ?? b.status } : b))
        );
      }
    );
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const list = recipients.split(/[\n,;]+/).map((r) => r.trim()).filter(Boolean);
      const { broadcast } = await createBroadcast(sessionId, message, list);
      setBroadcasts((prev) => [broadcast, ...prev]);
      setMessage('');
      setRecipients('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function onCancel(id: string) {
    try {
      await cancelBroadcast(id);
      setBroadcasts((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'failed' } : b)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <PageHeader title="Broadcasts" subtitle="Send one message to many recipients with live progress." />

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-white">New broadcast</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="label">Session</label>
            <select className="input" value={sessionId} onChange={(e) => setSessionId(e.target.value)} required>
              {sessions.length === 0 && <option value="">No sessions yet</option>}
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message text" required />
          </div>
          <div>
            <label className="label">Recipients — one phone or JID per line</label>
            <textarea className="input" rows={4} value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder={'255712345678\n255798765432'} required />
          </div>
          <button type="submit" className="btn-primary" disabled={sending || sessions.length === 0}>
            {sending ? 'Queuing…' : 'Send broadcast'}
          </button>
        </form>
      </Card>

      {loading ? (
        <Spinner label="Loading broadcasts…" />
      ) : broadcasts.length === 0 ? (
        <EmptyState title="No broadcasts yet" />
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => {
            const pct = b.total > 0 ? Math.round(((b.sent + b.failed) / b.total) * 100) : 0;
            return (
              <Card key={b.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{b.message}</p>
                    <p className="text-xs text-slate-500">
                      {b.session_name ?? '—'} · {new Date(b.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    {b.status === 'running' && (
                      <button className="btn-secondary text-xs" onClick={() => onCancel(b.id)}>Cancel</button>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>{pct}%</span>
                    <span>
                      Sent <b className="text-emerald-400">{b.sent}</b> · Failed <b className="text-red-400">{b.failed}</b> · Pending{' '}
                      {Math.max(0, b.total - b.sent - b.failed)} / {b.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
