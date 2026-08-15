'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  deleteSession,
  getSession,
  sendTestMessage,
  sessionAction,
  updateSession,
  type Session,
} from '@/lib/api/sessions';
import { onEvent } from '@/lib/socket';
import { Card, ErrorBox, PageHeader, Spinner, StatusBadge } from '@/components/ui';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const [newName, setNewName] = useState('');
  const [jid, setJid] = useState('');
  const [text, setText] = useState('');

  const refresh = useCallback(async () => {
    try {
      const { session } = await getSession(id);
      setSession(session);
      setNewName(session.name);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const events = ['session.connected', 'session.reconnecting', 'session.disconnected', 'session.pairing', 'session.updated', 'session.credential'];
    const unsubs = events.map((event) =>
      onEvent<{ sessionId: string; status?: string }>(event, ({ sessionId, status }) => {
        if (sessionId === id) setSession((prev) => (prev ? { ...prev, status: status ?? prev.status } : prev));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [id]);

  async function act(action: string, label: string) {
    setBusy(label);
    setError('');
    try {
      await sessionAction(id, action as never);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy('');
    }
  }

  async function onRename(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const { session } = await updateSession(id, { name: newName });
      setSession(session);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await sendTestMessage(id, jid, text);
      setText('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onDelete() {
    if (!confirm('Delete this session permanently?')) return;
    try {
      await deleteSession(id);
      router.push('/sessions');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (error && !session) return <ErrorBox message={error} />;
  if (!session) return <Spinner label="Loading session…" />;

  return (
    <div>
      <PageHeader
        title={session.name}
        subtitle={`Session ${session.id}`}
        action={<StatusBadge status={session.status} />}
      />

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-white">Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Phone</dt><dd>{session.phone ? `+${session.phone}` : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Credential</dt><dd>{session.credential_attached ? `Attached · ends ${session.credential_hint}` : 'Not issued'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Expires</dt><dd>{session.credential_expires_at ? new Date(session.credential_expires_at).toLocaleString() : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Last seen</dt><dd>{session.last_seen_at ? new Date(session.last_seen_at).toLocaleString() : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Created</dt><dd>{new Date(session.created_at).toLocaleString()}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary text-xs" onClick={() => act('reconnect', 'reconnect')} disabled={Boolean(busy)}>Reconnect</button>
            <button className="btn-secondary text-xs" onClick={() => act('restart', 'restart')} disabled={Boolean(busy)}>Restart</button>
            {session.status !== 'disconnected' && (
              <button className="btn-secondary text-xs" onClick={() => act('disconnect', 'disconnect')} disabled={Boolean(busy)}>Disconnect</button>
            )}
            <button className="btn-danger text-xs" onClick={onDelete} disabled={Boolean(busy)}>Delete session</button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-white">Rename</h2>
          <form onSubmit={onRename} className="flex gap-2">
            <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            <button type="submit" className="btn-primary shrink-0">Save</button>
          </form>

          <h2 className="mb-3 mt-6 text-sm font-semibold text-white">Send test message</h2>
          <form onSubmit={onSend} className="space-y-2">
            <input className="input" placeholder="JID or phone (e.g. 255712345678)" value={jid} onChange={(e) => setJid(e.target.value)} required />
            <textarea className="input" rows={2} placeholder="Message text" value={text} onChange={(e) => setText(e.target.value)} required />
            <button type="submit" className="btn-primary w-full" disabled={session.status !== 'connected'}>
              {session.status === 'connected' ? 'Send' : 'Session must be connected'}
            </button>
          </form>
        </Card>
      </div>

      {session.status === 'expired' && (
        <Card className="mt-4 border-red-500/40">
          <p className="font-medium text-red-400">⚠️ Session expired</p>
          <p className="mt-1 text-sm text-slate-400">
            Your session credential has expired. Click <b>Reconnect WhatsApp</b> to link again and receive a new credential.
          </p>
        </Card>
      )}
    </div>
  );
}
