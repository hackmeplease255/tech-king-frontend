'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '@/lib/api/client';
import { Card, ErrorBox, PageHeader, Spinner } from '@/components/ui';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [model, setModel] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ enabled: boolean; model: string | null }>('/ai/status')
      .then((s) => {
        setEnabled(s.enabled);
        setModel(s.model ?? '');
      })
      .catch((err) => setError((err as Error).message));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const userMsg: ChatMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const { reply } = await apiFetch<{ reply: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })) }),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError((err as Error).message);
      setMessages((prev) => prev.filter((m) => m !== userMsg));
    } finally {
      setBusy(false);
    }
  }

  if (enabled === null) return <Spinner label="Checking AI status…" />;

  return (
    <div>
      <PageHeader
        title="AI"
        subtitle={enabled ? `AI is enabled (${model}) — gateway runs on the VPS.` : 'AI is not configured on the backend yet.'}
      />

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <Card className="mx-auto max-w-2xl">
        <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              Ask anything — the backend forwards to the configured AI provider.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                  m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {busy && <p className="text-center text-xs text-slate-500">Thinking…</p>}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            className="input"
            placeholder={enabled ? 'Type a message…' : 'AI disabled on backend'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!enabled || busy}
          />
          <button type="submit" className="btn-primary shrink-0" disabled={!enabled || busy || !input.trim()}>
            Send
          </button>
        </form>
      </Card>
    </div>
  );
}
