'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="mt-1 text-sm text-slate-400">The first account on a fresh install becomes the owner.</p>
        </div>
        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required autoComplete="new-password" />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" required autoComplete="new-password" />
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-500 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
