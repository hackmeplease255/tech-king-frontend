'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { deleteCustomer, getCustomer, updateCustomer, type Customer } from '@/lib/api/customers';
import { Card, ErrorBox, PageHeader, Spinner } from '@/components/ui';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [tags, setTags] = useState('');

  useEffect(() => {
    getCustomer(id)
      .then(({ customer }) => {
        setCustomer(customer);
        setName(customer.name ?? '');
        setPhone(customer.phone ?? '');
        setNotes(customer.notes ?? '');
        setLanguage(customer.language);
        setTags(customer.tags.join(', '));
      })
      .catch((err) => setError((err as Error).message));
  }, [id]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      const { customer } = await updateCustomer(id, {
        name: name || null,
        notes: notes || null,
        language,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setCustomer(customer);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onDelete() {
    if (!confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      router.push('/customers');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (error && !customer) return <ErrorBox message={error} />;
  if (!customer) return <Spinner label="Loading customer…" />;

  return (
    <div>
      <PageHeader title={customer.name || 'Customer'} subtitle={customer.jid} />
      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <form onSubmit={onSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Language</label>
                <select className="input" value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}>
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vip, wholesale" />
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary">Save</button>
              {saved && <span className="text-sm text-emerald-400">Saved ✓</span>}
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-white">Info</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Session</dt><dd>{customer.session_name ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">JID</dt><dd className="font-mono text-xs">{customer.jid}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Created</dt><dd>{new Date(customer.created_at).toLocaleDateString()}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Last interaction</dt><dd>{customer.last_interaction_at ? new Date(customer.last_interaction_at).toLocaleString() : '—'}</dd></div>
          </dl>
          <button className="btn-danger mt-4 w-full text-xs" onClick={onDelete}>Delete customer</button>
        </Card>
      </div>
    </div>
  );
}
