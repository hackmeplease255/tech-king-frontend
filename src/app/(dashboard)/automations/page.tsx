'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { listSessions, type Session } from '@/lib/api/sessions';
import {
  createAutomation,
  deleteAutomation,
  listAutomations,
  updateAutomation,
  type Automation,
} from '@/lib/api/automations';
import { Card, EmptyState, ErrorBox, PageHeader, Spinner } from '@/components/ui';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<'interval' | 'keyword'>('interval');
  const [minutes, setMinutes] = useState('60');
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const { automations } = await listAutomations();
    setAutomations(automations);
  }

  useEffect(() => {
    void (async () => {
      try {
        const s = await listSessions();
        setSessions(s.sessions);
        if (s.sessions.length > 0) setSessionId(s.sessions[0].id);
        await refresh();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const triggerConfig = triggerType === 'interval' ? { minutes: Number(minutes) } : { keyword };
      const actionConfig = { text: message, ...(target ? { jid: target } : {}) };
      await createAutomation({ sessionId, name, triggerType, triggerConfig, actionType: 'send_message', actionConfig });
      setName('');
      setKeyword('');
      setMessage('');
      setTarget('');
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(a: Automation) {
    try {
      await updateAutomation(a.id, { enabled: !a.enabled });
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(a: Automation) {
    if (!confirm(`Delete automation "${a.name}"?`)) return;
    try {
      await deleteAutomation(a.id);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading) return <Spinner label="Loading automations…" />;

  return (
    <div>
      <PageHeader title="Automations" subtitle="Scheduled or keyword-triggered messages." />

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-white">New automation</h2>
        <form onSubmit={onCreate} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Morning promo" required />
            </div>
            <div>
              <label className="label">Session</label>
              <select className="input" value={sessionId} onChange={(e) => setSessionId(e.target.value)} required>
                {sessions.length === 0 && <option value="">No sessions yet</option>}
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Trigger</label>
              <select className="input" value={triggerType} onChange={(e) => setTriggerType(e.target.value as 'interval' | 'keyword')}>
                <option value="interval">Every N minutes</option>
                <option value="keyword">On keyword</option>
              </select>
            </div>
            {triggerType === 'interval' ? (
              <div>
                <label className="label">Every (minutes)</label>
                <input type="number" min={1} className="input" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
              </div>
            ) : (
              <div>
                <label className="label">Keyword</label>
                <input className="input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="promo" />
              </div>
            )}
          </div>
          <div>
            <label className="label">Message to send</label>
            <textarea className="input" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <div>
            <label className="label">Target (leave empty for sender of keyword)</label>
            <input className="input" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="255712345678 or group JID" />
          </div>
          <button type="submit" className="btn-primary" disabled={saving || sessions.length === 0}>
            {saving ? 'Creating…' : 'Create automation'}
          </button>
        </form>
      </Card>

      {automations.length === 0 ? (
        <EmptyState title="No automations yet" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {automations.map((a) => (
            <Card key={a.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{a.name}</h3>
                <span className={`badge ${a.enabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
                  {a.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {a.trigger_type === 'interval'
                  ? `Every ${String(a.trigger_config.minutes ?? 60)} min`
                  : `On keyword "${a.trigger_config.keyword}"`}{' '}
                · {a.session_name ?? '—'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Next run: {a.next_run_at ? new Date(a.next_run_at).toLocaleString() : '—'}
                {a.last_run_at ? ` · Last: ${new Date(a.last_run_at).toLocaleString()}` : ''}
              </p>
              <div className="mt-3 flex gap-2">
                <button className="btn-secondary text-xs" onClick={() => toggle(a)}>{a.enabled ? 'Disable' : 'Enable'}</button>
                <button className="btn-danger text-xs" onClick={() => remove(a)}>Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
