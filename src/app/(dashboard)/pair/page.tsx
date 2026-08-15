'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, QrCode, Terminal, Zap } from 'lucide-react';
import { createSession, listSessions, pairSession, type Session } from '@/lib/api/sessions';
import { ErrorBox } from '@/components/ui';

export default function PairPage() {
  const [mode, setMode] = useState<'qr' | 'pair'>('pair');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    void listSessions().then(({ sessions }) => setSessions(sessions));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCode('');
    setBusy(true);
    try {
      // Reuse an existing session for this number, otherwise auto-create one.
      // Note: a session only gets a phone once paired, so match by name too —
      // otherwise every click spawns a duplicate session.
      const clean = phone.replace(/[^\d]/g, '');
      const latest = await listSessions();
      const all = latest.sessions;
      let session = all.find((s) => s.phone === clean)
        || all.find((s) => s.name === `WhatsApp +${clean}`)
        || all.find((s) => !s.credential_attached && !s.phone);
      if (!session) {
        const created = await createSession(`WhatsApp +${clean}`);
        session = created.session;
      }
      setSessions(all);
      const { pairingCode } = await pairSession(session.id, clean);
      setCode(pairingCode);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-bold text-foreground">Connect Your Device</h1>
      <p className="label-caps mt-1 text-muted-foreground">Link your WhatsApp account securely</p>

      <section className="glass-panel mt-5 rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Terminal className="mt-0.5 size-4 text-primary" />
            <p className="label-caps text-muted-foreground">Link your account securely</p>
          </div>
          <div className="mt-1 flex gap-1.5">
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          </div>
        </div>

        <div className="mt-5 inline-flex rounded-full bg-surface-2 p-1">
          {(
            [
              { id: 'qr', label: 'QR Code', icon: QrCode },
              { id: 'pair', label: 'Pairing Code', icon: KeyRound },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
                mode === tab.id ? 'neon-fill' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="size-3.5" />
              <span className="label-caps">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="phone" className="label-caps text-muted-foreground">Phone number</label>
              <span className="label-caps neon-text">Format: 2557…</span>
            </div>
            <div className="glass-input mt-2 flex items-center gap-2 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary">
              <span className="text-sm text-muted-foreground">+</span>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                placeholder="2557…"
                required
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            <p className="label-caps mt-2 text-muted-foreground/60">* Omit leading zero. Include country prefix.</p>
          </div>

          {error && <div className="mt-4"><ErrorBox message={error} /></div>}

          <button
            type="submit"
            disabled={busy || !phone}
            className="neon-fill mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="label-caps text-sm">
              {busy ? 'Starting…' : mode === 'qr' ? 'Generate QR code' : 'Request pairing code'}
            </span>
            <Zap className="size-3.5" />
          </button>
        </form>
      </section>

      {code && (
        <section className="glass-panel mt-4 rounded-3xl p-6">
          <p className="label-caps text-muted-foreground">
            Open WhatsApp → Settings → Linked devices → Link with phone number → enter:
          </p>
          <p className="mt-3 select-all rounded-xl bg-surface-2/80 px-4 py-4 text-center font-mono text-xl font-semibold tracking-widest text-foreground ring-1 ring-border">
            {code}
          </p>
          <p className="label-caps mt-3 text-muted-foreground/60">
            After linking, your session is sent to that WhatsApp number automatically.
          </p>
        </section>
      )}
    </div>
  );
}
