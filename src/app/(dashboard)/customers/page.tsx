'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listCustomers, type Customer } from '@/lib/api/customers';
import { Card, EmptyState, ErrorBox, PageHeader, Spinner } from '@/components/ui';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    listCustomers(debounced)
      .then(({ customers, total }) => {
        setCustomers(customers);
        setTotal(total);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [debounced]);

  return (
    <div>
      <PageHeader title="Customers" subtitle="People who message your linked WhatsApp numbers." />

      <div className="mb-4 max-w-md">
        <input className="input" placeholder="Search by name, phone or tags…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      {loading ? (
        <Spinner label="Loading customers…" />
      ) : customers.length === 0 ? (
        <EmptyState title={debounced ? 'No customers match your search' : 'No customers yet'} hint="Customers appear automatically when people message your sessions." />
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-400">{total} customer(s)</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {customers.map((c) => (
              <Link key={c.id} href={`/customers/${c.id}`} className="card hover:border-slate-600">
                <p className="font-semibold text-white">{c.name || 'Unknown'}</p>
                <p className="text-sm text-slate-400">{c.phone ? `+${c.phone}` : c.jid}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="badge bg-slate-800 text-slate-300">{c.session_name ?? '—'}</span>
                  {c.language === 'sw' && <span className="badge bg-brand-500/15 text-brand-400">sw</span>}
                  {c.tags.map((t) => (
                    <span key={t} className="badge bg-slate-800 text-slate-300">{t}</span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {c.last_interaction_at ? `Last interaction ${new Date(c.last_interaction_at).toLocaleString()}` : '—'}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
