'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  attachSession,
  createSession,
  deleteSession,
  listSessions,
  sessionAction,
  type Session,
} from '@/lib/api/sessions';
import { onEvent } from '@/lib/socket';
import { Card, EmptyState, ErrorBox, PageHeader, Spinner, StatusBadge } from '@/components/ui';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const [credential, setCredential] = useState('');
  const [attaching, setAttaching] = useState(false);
  const [attachMsg, setAttachMsg] = useState('');

  async function refresh() {
    try {
      const { sessions } = await listSessions();
      setSessions(sessions);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  // Live status updates
  useEffect(() => {
    const events = ['session.connected', 'session.reconnecting', 'session.disconnected', 'session.pairing', 'session.updated', 'session.created', 'session.credential'];
    const unsubs = events.map((event) =>
      onEvent<{ sessionId: string; status?: string }>(event, ({ sessionId, status }) => {
        setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: status ?? s.status } : s)));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const { session } = await createSession(newName);
      setSessions((prev) => [session, ...prev]);
      setNewName('');
      setNotice(`Session "${session.name}" created — open it and click Pair.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function onAttach(e: FormEvent) {
    e.preventDefault();
    setAttaching(true);
    setAttachMsg('');
    setError('');
    try {
      const { session, message } = await attachSession(credential.trim());
      setCredential('');
      setAttachMsg(`${message} — "${session.name}" is now on your dashboard.`);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAttaching(false);
    }
  }

  async function onAction(id: string, action: 'reconnect' | 'disconnect' | 'restart') {
    try {
      await sessionAction(id, action);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete session "${name}"? This also removes its WhatsApp state.`)) return;
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <PageHeader
        title="WhatsApp Sessions"
        subtitle="Link WhatsApp with a pairing code, then keep the 64-char credential secret."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {/* Create session */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-white">Create session</h2>
          <form onSubmit={onCreate} className="flex gap-2">
            <input className="input" placeholder="Session name (e.g. BUSINESS)" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            <button type="submit" className="btn-primary shrink-0" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">After creating, open the session and click Pair to link your WhatsApp.</p>
        </Card>

        {/* Attach by credential */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-white">WhatsApp Session / Session ID</h2>
          <form onSubmit={onAttach} className="flex gap-2">
            <input
              className="input font-mono"
              placeholder="Paste your 64-character session credential"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
              minLength={64}
              maxLength={64}
            />
            <button type="submit" className="btn-primary shrink-0" disabled={attaching}>
              {attaching ? 'Verifying…' : 'Attach'}
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            Get this credential from the WhatsApp message your bot sent after linking. It is never shown here again after attach.
          </p>
        </Card>
      </div>

      {attachMsg && <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">{attachMsg}</p>}
      {notice && <p className="mb-4 rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-400">{notice}</p>}
      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      {loading ? (
        <Spinner label="Loading sessions…" />
      ) : sessions.length === 0 ? (
        <EmptyState title="No sessions yet" hint="Create a session above, or paste a credential to attach an existing one." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((s) => (
            <Card key={s.id}>
              <div className="flex items-center justify-between">
                <Link href={`/sessions/${s.id}`} className="font-semibold text-white hover:text-brand-400">
                  {s.name}
                </Link>
                <StatusBadge status={s.status} />
              </div>
              <p className="mt-1 text-sm text-slate-400">{s.phone ? `+${s.phone}` : 'Not paired'}</p>
              <p className="text-xs text-slate-500">
                {s.credential_attached ? (
                  <>Credential attached{/* hint */} · ends <span className="font-mono">{s.credential_hint}</span> · expires {s.credential_expires_at ? new Date(s.credential_expires_at).toLocaleDateString() : '—'}</>
                ) : (
                  'No credential yet — pair WhatsApp first'
                )}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/sessions/${s.id}`} className="btn-secondary text-xs">Open</Link>
                <button className="btn-secondary text-xs" onClick={() => onAction(s.id, 'reconnect')}>Reconnect</button>
                <button className="btn-secondary text-xs" onClick={() => onAction(s.id, 'restart')}>Restart</button>
                {s.status !== 'disconnected' && (
                  <button className="btn-secondary text-xs" onClick={() => onAction(s.id, 'disconnect')}>Disconnect</button>
                )}
                <button className="btn-danger text-xs" onClick={() => onDelete(s.id, s.name)}>Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
