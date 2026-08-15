'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { pairSession, listSessions, type Session } from '@/lib/api/sessions';
import { onEvent } from '@/lib/socket';
import { Card, ErrorBox, PageHeader, Spinner, StatusBadge } from '@/components/ui';

export default function PairPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void listSessions().then(({ sessions }) => {
      setSessions(sessions);
      if (sessions.length > 0 && !sessionId) setSessionId(sessions[0].id);
    });
  }, [sessionId]);

  // Auto-clear the code once the phone pairs
  useEffect(() => {
    return onEvent<{ sessionId: string }>('session.connected', ({ sessionId: sid }) => {
      if (sid === sessionId) setCode('');
    });
  }, [sessionId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCode('');
    setBusy(true);
    try {
      const { pairingCode } = await pairSession(sessionId, phone);
      setCode(pairingCode);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Pair WhatsApp"
        subtitle="Step 1 — choose a session and enter the WhatsApp number to link."
      />

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Session</label>
            <select className="input" value={sessionId} onChange={(e) => setSessionId(e.target.value)} required>
              {sessions.length === 0 && <option value="">No sessions — create one first</option>}
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">WhatsApp number (with country code, e.g. 2557XXXXXXXX)</label>
            <input
              className="input"
              placeholder="255712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              inputMode="numeric"
            />
          </div>
          {error && <ErrorBox message={error} />}
          <button type="submit" className="btn-primary w-full" disabled={busy || sessions.length === 0}>
            {busy ? 'Starting…' : 'Get pairing code'}
          </button>
        </form>
      </Card>

      {code && (
        <Card className="mt-4 border-brand-500/40">
          <h2 className="mb-1 text-sm font-semibold text-white">Pairing code</h2>
          <p className="text-xs text-slate-400">
            Open WhatsApp on your phone → Settings → Linked devices → <b>Link with phone number</b> → enter:
          </p>
          <p className="my-4 select-all rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest text-brand-400">
            {code}
          </p>
          <p className="text-xs text-slate-500">
            After linking, a <b>64-character session credential</b> is sent to that WhatsApp number. Keep it secret — you will use it
            to attach the session to any deployment.
          </p>
        </Card>
      )}

      {sessions.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-400">Sessions</h2>
          <div className="space-y-2">
            {sessions.map((s) => (
              <Card key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-white">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.phone ? `+${s.phone}` : 'Not paired'}</p>
                </div>
                <StatusBadge status={s.status} />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
