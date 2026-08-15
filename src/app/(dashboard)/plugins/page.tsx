'use client';

import { useEffect, useState } from 'react';
import { listPlugins, setPlugin, configurePlugin, type Plugin } from '@/lib/api/plugins';
import { listSessions, type Session } from '@/lib/api/sessions';
import { Card, ErrorBox, PageHeader, Spinner, StatusBadge } from '@/components/ui';

interface PluginCfg {
  enabled: boolean;
  config?: Record<string, unknown>;
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const [p, s] = await Promise.all([listPlugins(), listSessions()]);
        setPlugins(p.plugins);
        setSessions(s.sessions);
        if (s.sessions.length > 0) setSessionId(s.sessions[0].id);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const session = sessions.find((s) => s.id === sessionId);
  const active = (session?.plugins ?? {}) as Record<string, PluginCfg>;

  async function toggle(pluginId: string, enabled: boolean) {
    setError('');
    try {
      await setPlugin(sessionId, pluginId, enabled);
      const { sessions } = await listSessions();
      setSessions(sessions);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveConfig(pluginId: string, config: Record<string, unknown>) {
    setError('');
    try {
      await configurePlugin(sessionId, pluginId, config);
      const { sessions } = await listSessions();
      setSessions(sessions);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading) return <Spinner label="Loading plugins…" />;

  return (
    <div>
      <PageHeader title="Plugins" subtitle="Plugins run on the VPS backend — the dashboard only manages them." />

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <div className="mb-4 max-w-sm">
        <label className="label">Session</label>
        <select className="input" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
          {sessions.length === 0 && <option value="">No sessions yet</option>}
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.status}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plugins.map((p) => {
          const cfg = active[p.id];
          const enabled = cfg?.enabled ?? p.enabled_default;
          return (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{p.name}</h3>
                <span className={`badge ${enabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
                  {enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{p.description}</p>
              <p className="mt-1 text-xs text-slate-500">v{p.version}</p>

              {p.id === 'auto-reply' && (
                <AutoReplyConfig
                  initial={cfg?.config?.rules as Array<{ keywords: string; reply: string }> | undefined}
                  onSave={(rules) => saveConfig(p.id, { rules })}
                />
              )}
              {p.id === 'greeting' && (
                <div className="mt-3">
                  <label className="label">Greeting text</label>
                  <textarea
                    className="input"
                    rows={2}
                    defaultValue={(cfg?.config?.text as string) ?? ''}
                    onBlur={(e) => e.target.value !== (cfg?.config?.text ?? '') && saveConfig(p.id, { text: e.target.value })}
                  />
                </div>
              )}
              {p.id === 'ai-assistant' && (
                <div className="mt-3">
                  <label className="label">System prompt</label>
                  <textarea
                    className="input"
                    rows={2}
                    defaultValue={(cfg?.config?.systemPrompt as string) ?? ''}
                    onBlur={(e) => e.target.value !== (cfg?.config?.systemPrompt ?? '') && saveConfig(p.id, { systemPrompt: e.target.value })}
                  />
                </div>
              )}

              <div className="mt-4">
                {session ? (
                  <button className={`${enabled ? 'btn-secondary' : 'btn-primary'} w-full text-xs`} onClick={() => toggle(p.id, !enabled)}>
                    {enabled ? 'Disable' : 'Enable'}
                  </button>
                ) : (
                  <p className="text-xs text-slate-500">Create a session to enable plugins.</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {sessions.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-400">Session status</h2>
          <div className="flex flex-wrap gap-2">
            {sessions.map((s) => (
              <button key={s.id} onClick={() => setSessionId(s.id)} className={`badge ${s.id === sessionId ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-800 text-slate-400'}`}>
                {s.name} <StatusBadge status={s.status} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AutoReplyConfig({
  initial,
  onSave,
}: {
  initial?: Array<{ keywords: string; reply: string }>;
  onSave: (rules: Array<{ keywords: string; reply: string }>) => void;
}) {
  const [rules, setRules] = useState<Array<{ keywords: string; reply: string }>>(initial ?? [{ keywords: '', reply: '' }]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setRules(initial && initial.length > 0 ? initial : [{ keywords: '', reply: '' }]);
  }, [initial]);

  function save() {
    onSave(rules.filter((r) => r.keywords.trim() && r.reply.trim()));
    setDirty(false);
  }

  return (
    <div className="mt-3 space-y-2">
      {rules.map((r, i) => (
        <div key={i} className="space-y-1 rounded-lg border border-slate-800 p-2">
          <input
            className="input text-xs"
            placeholder="Keywords (comma separated)"
            value={r.keywords}
            onChange={(e) => {
              const next = [...rules];
              next[i] = { ...next[i], keywords: e.target.value };
              setRules(next);
              setDirty(true);
            }}
          />
          <input
            className="input text-xs"
            placeholder="Reply"
            value={r.reply}
            onChange={(e) => {
              const next = [...rules];
              next[i] = { ...next[i], reply: e.target.value };
              setRules(next);
              setDirty(true);
            }}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => {
            setRules((prev) => [...prev, { keywords: '', reply: '' }]);
            setDirty(true);
          }}
        >
          + Add rule
        </button>
        <button type="button" className="btn-primary text-xs" onClick={save} disabled={!dirty}>
          Save rules
        </button>
      </div>
    </div>
  );
}
