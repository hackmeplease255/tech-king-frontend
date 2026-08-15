'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { register as apiRegister } from '@/lib/api/auth';
import { setToken } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      const { token, user } = await apiRegister(name, email, password, 'en');
      setToken(token);
      setUser(user);
      router.push('/dashboard');
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
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Create account</h1>
          <p className="label-caps mt-2 text-muted-foreground">
            The first account on a fresh install becomes the owner
          </p>
        </div>

        <form onSubmit={onSubmit} className="glass-panel rounded-3xl p-7">
          <div className="space-y-4">
            {(
              [
                { id: 'name', type: 'text', label: 'Full name', value: name, set: setName, placeholder: 'Jane Doe' },
                { id: 'email', type: 'email', label: 'Email', value: email, set: setEmail, placeholder: 'you@example.com' },
                { id: 'password', type: 'password', label: 'Password', value: password, set: setPassword, placeholder: 'Min 8 characters' },
                { id: 'confirm', type: 'password', label: 'Confirm password', value: confirm, set: setConfirm, placeholder: 'Repeat password' },
              ] as const
            ).map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="label">{f.label}</label>
                <div className="glass-input rounded-2xl px-5 py-3 focus-within:ring-2 focus-within:ring-primary">
                  <input
                    id={f.id}
                    type={f.type}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    required
                  />
                </div>
              </div>
            ))}
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
            <span className="label-caps text-sm">{busy ? 'Creating…' : 'Create account'}</span>
            <Zap className="size-4" />
          </button>

          <p className="label-caps mt-5 text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="neon-text hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
