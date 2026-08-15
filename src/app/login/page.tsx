'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="neon-fill mx-auto grid size-16 place-items-center rounded-3xl font-display text-2xl font-bold">
            TK
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">TECH KING AUTOMATION</h1>
          <p className="label-caps mt-2 text-muted-foreground">Fast. Free. Smart. Reliable.</p>
        </div>

        <form onSubmit={onSubmit} className="glass-panel rounded-3xl p-7">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="glass-input rounded-2xl px-5 py-3 focus-within:ring-2 focus-within:ring-primary">
                <input
                  id="email"
                  type="email"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="glass-input rounded-2xl px-5 py-3 focus-within:ring-2 focus-within:ring-primary">
                <input
                  id="password"
                  type="password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="neon-fill mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="label-caps text-sm">{busy ? 'Signing in…' : 'Sign in'}</span>
            <Zap className="size-4" />
          </button>

          <p className="label-caps mt-5 text-center text-muted-foreground">
            No account?{' '}
            <Link href="/register" className="neon-text hover:underline">
              Register
            </Link>
          </p>
        </form>

        <p className="label-caps mt-6 text-center text-muted-foreground/50">
          Login required — dashboard is protected
        </p>
      </div>
    </div>
  );
}
