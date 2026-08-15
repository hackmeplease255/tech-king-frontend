'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '@/lib/api/client';
import { Card, EmptyState, ErrorBox, PageHeader, Spinner } from '@/components/ui';

interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState('');

  async function refresh() {
    const { keys } = await apiFetch<{ keys: ApiKey[] }>('/api-keys');
    setKeys(keys);
  }

  useEffect(() => {
    refresh()
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const { key } = await apiFetch<{ key: string }>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setRevealed(`${name}: ${key}`);
      setName('');
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Revoke this API key?')) return;
    try {
      await apiFetch(`/api-keys/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <PageHeader
        title="API Keys"
        subtitle="Use keys to call the Tech King API from your own systems (Bearer token)."
      />

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      {revealed && (
        <Card className="mb-4 border-emerald-500/40">
          <p className="text-sm font-semibold text-emerald-400">Key created — copy it now, it will not be shown again:</p>
          <p className="mt-2 select-all rounded-lg bg-slate-950 px-3 py-2 font-mono text-sm text-white">{revealed}</p>
        </Card>
      )}

      <Card className="mb-6 max-w-md">
        <form onSubmit={onCreate} className="flex gap-2">
          <input className="input" placeholder="Key name (e.g. my-app)" value={name} onChange={(e) => setName(e.target.value)} required />
          <button type="submit" className="btn-primary shrink-0">Create</button>
        </form>
      </Card>

      {loading ? (
        <Spinner label="Loading keys…" />
      ) : keys.length === 0 ? (
        <EmptyState title="No API keys" hint="Create a key to call the API programmatically." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {keys.map((k) => (
            <Card key={k.id}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{k.name}</p>
                <button className="btn-danger text-xs" onClick={() => onDelete(k.id)}>Revoke</button>
              </div>
              <p className="mt-1 font-mono text-sm text-slate-400">{k.prefix}…</p>
              <p className="mt-1 text-xs text-slate-500">
                Created {new Date(k.created_at).toLocaleDateString()}
                {k.last_used_at ? ` · Last used ${new Date(k.last_used_at).toLocaleString()}` : ' · Never used'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
