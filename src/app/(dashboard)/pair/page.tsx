'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Copy, Check, KeyRound, QrCode, Terminal, Zap } from 'lucide-react';
import { pairSession, listSessions, type Session } from '@/lib/api/sessions';
import { onEvent } from '@/lib/socket';
import { ErrorBox, PageHeader, Spinner, StatusBadge } from '@/components/ui';

export default function PairPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [phone, setPhone] = useState('');
  const [mode, setMode] = useState<'qr' | 'pair'>('pair');
  const [code, setCode] = useState('');
  const [credential, setCredential] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void listSessions().then(({ sessions }) => {
      setSessions(sessions);
      if (sessions.length > 0 && !sessionId) setSessionId(sessions[0].id);
    });
  }, [sessionId]);

  // Auto-clear the pairing code once the phone pairs
  useEffect(() => {
    return onEvent<{ sessionId: string }>('session.connected', ({ sessionId: sid }) => {
      if (sid === sessionId) setCode('');
    });
  }, [sessionId]);

  // One-time credential: the bot sends it to WhatsApp AND the site shows it here once.
  useEffect(() => {
    return onEvent<{ sessionId: string; credential?: string }>(
      'session.credential',
      ({ sessionId: sid, credential: cred }) => {
        if (sid === sessionId && cred) {
          setCredential(cred);
          setCopied(false);
        }
      }
    );
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

  async function copyCredential() {
    try {
      await navigator.clipboard.writeText(credential);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <PageHeader title="Connect Device" subtitle="Link your WhatsApp account securely" />

      {sessions.length === 0 && (
        <ErrorBox message="Create a session first on the Sessions page, then come back to pair it." />
      )}

      <section className="glass-panel rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Terminal className="mt-1 size-5 text-primary" />
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Connect Your Device</h2>
              <p className="label-caps mt-1 text-muted-foreground">Link your account securely</p>
            </div>
          </div>
          <div className="mt-2 flex gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
          </div>
        </div>

        <div className="mt-6 inline-flex rounded-full bg-surface-2 p-1">
          {(
            [
              { id: 'qr', label: 'QR Code', icon: QrCode },
              { id: 'pair', label: 'Pairing Code', icon: KeyRound },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all ${
                mode === tab.id ? 'neon-fill' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="size-3.5" />
              <span className="label-caps">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-7">
          <div>
            <label htmlFor="session" className="label-caps text-muted-foreground">Session</label>
            <div className="glass-input mt-3 rounded-2xl px-5 py-3 focus-within:ring-2 focus-within:ring-primary">
              <select
                id="session"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full bg-transparent text-sm outline-none [&>option]:bg-surface"
                required
              >
                {sessions.length === 0 && <option value="">No sessions — create one first</option>}
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label htmlFor="phone" className="label-caps text-muted-foreground">Phone number</label>
              <span className="label-caps neon-text">Format: 2557…</span>
            </div>
            <div className="glass-input mt-3 flex items-center gap-3 rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-primary">
              <span className="text-lg text-muted-foreground">+</span>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                placeholder="2557…"
                required
                className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            <p className="label-caps mt-3 text-muted-foreground/70">
              * Omit leading zero. Include country prefix.
            </p>
          </div>

          {error && <div className="mt-4"><ErrorBox message={error} /></div>}

          <button
            type="submit"
            disabled={busy || sessions.length === 0}
            className="neon-fill mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-4 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="label-caps text-sm">
              {busy ? 'Starting…' : mode === 'qr' ? 'Generate QR code' : 'Request pairing code'}
            </span>
            <Zap className="size-4" />
          </button>
        </form>
      </section>

      {code && (
        <section className="glass-panel rounded-3xl p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Pairing code</h2>
          <p className="label-caps mt-1 text-muted-foreground">
            Open WhatsApp → Settings → Linked devices → Link with phone number → enter:
          </p>
          <p className="neon-fill my-5 select-all rounded-2xl px-6 py-6 text-center font-display text-3xl font-bold tracking-[0.25em]">
            {code}
          </p>
          <p className="label-caps text-muted-foreground/70">
            After linking, the bot sends your SESSION message to that WhatsApp number — keep the credential secret.
          </p>
        </section>
      )}

      {credential && (
        <section className="glass-panel rounded-3xl border-success/40 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-success">🌟 Session generated</h2>
              <p className="label-caps mt-1 text-muted-foreground">
                Shown once — also sent to your WhatsApp. Use it to connect/deploy.
              </p>
            </div>
            <button
              onClick={() => void copyCredential()}
              className="flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-4 py-2.5 text-success transition-colors hover:bg-success/20"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              <span className="label-caps">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="mt-4 select-all break-all rounded-2xl bg-surface-2/80 px-5 py-4 font-mono text-sm text-foreground ring-1 ring-border">
            {credential}
          </p>
          <p className="label-caps mt-3 text-muted-foreground/70">
            Paste it into the “WhatsApp Session / Session ID” field on the Sessions page to attach this session.
          </p>
        </section>
      )}

      {sessions.length > 0 && (
        <section className="glass-panel rounded-3xl p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Sessions</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2/70 px-4 py-3.5">
                <div>
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="label-caps mt-1 text-muted-foreground">{s.phone ? `+${s.phone}` : 'Not paired'}</p>
                </div>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
