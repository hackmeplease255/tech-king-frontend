'use client';

import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{message}</div>;
}

const STATUS_STYLES: Record<string, string> = {
  connected: 'bg-emerald-500/15 text-emerald-400',
  connecting: 'bg-amber-500/15 text-amber-400',
  pairing: 'bg-amber-500/15 text-amber-400',
  reconnecting: 'bg-orange-500/15 text-orange-400',
  disconnected: 'bg-slate-500/15 text-slate-400',
  idle: 'bg-slate-500/15 text-slate-400',
  expired: 'bg-red-500/15 text-red-400',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'bg-slate-500/15 text-slate-400';
  return <span className={`badge ${cls}`}>{status}</span>;
}

export function StatCard({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Card>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card className="py-10 text-center">
      <p className="font-medium text-slate-300">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </Card>
  );
}
