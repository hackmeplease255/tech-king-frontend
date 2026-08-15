'use client';

import { useState, type FormEvent } from 'react';
import { updateMe } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth-context';
import { Card, ErrorBox, PageHeader } from '@/components/ui';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [language, setLanguage] = useState<'en' | 'sw'>(user?.language ?? 'en');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onProfile(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    setBusy(true);
    try {
      const { user } = await updateMe({ name, phone: phone || null, language });
      setUser(user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    setBusy(true);
    try {
      await updateMe({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Your account profile and security." />

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}
      {saved && <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">Saved ✓</p>}

      <Card className="mb-4">
        <h2 className="mb-3 text-sm font-semibold text-white">Profile</h2>
        <form onSubmit={onProfile} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="2557XXXXXXXX" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Email</label>
              <input className="input" value={user.email} disabled />
            </div>
            <div>
              <label className="label">Language</label>
              <select className="input" value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}>
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={busy}>Save profile</button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-white">Change password</h2>
        <form onSubmit={onPassword} className="space-y-3">
          <div>
            <label className="label">Current password</label>
            <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <div>
            <label className="label">New password (min 8 characters)</label>
            <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          <button type="submit" className="btn-primary" disabled={busy}>Update password</button>
        </form>
      </Card>
    </div>
  );
}
