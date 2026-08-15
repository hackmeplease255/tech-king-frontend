'use client';

import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
        {subtitle && <p className="label-caps mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass-panel rounded-3xl p-5 ${className}`}>{children}</div>;
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  connected: 'border-success/40 bg-success/10 text-success',
  connecting: 'border-warning/40 bg-warning/10 text-warning',
  pairing: 'border-warning/40 bg-warning/10 text-warning',
  reconnecting: 'border-warning/40 bg-warning/10 text-warning',
  disconnected: 'border-muted/40 bg-muted/10 text-muted-foreground',
  idle: 'border-muted/40 bg-muted/10 text-muted-foreground',
  expired: 'border-danger/40 bg-danger/10 text-danger',
  queued: 'border-muted/40 bg-muted/10 text-muted-foreground',
  running: 'border-warning/40 bg-warning/10 text-warning',
  completed: 'border-success/40 bg-success/10 text-success',
  failed: 'border-danger/40 bg-danger/10 text-danger',
  deleted: 'border-danger/40 bg-danger/10 text-danger',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'border-muted/40 bg-muted/10 text-muted-foreground';
  return <span className={`label-caps rounded-full border px-3 py-1 ${cls}`}>{status}</span>;
}

export function StatCard({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <Card className="p-5">
      <p className="label-caps text-muted-foreground">{label}</p>
      <p className="mt-4 font-display text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-success">{sub}</p>}
    </Card>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card className="py-12 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {hint && <p className="label-caps mt-2 text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function PillButton({
  children,
  onClick,
  variant = 'secondary',
  className = '',
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const styles = {
    primary: 'neon-fill hover:-translate-y-0.5',
    secondary: 'bg-surface-2/60 text-muted-foreground hover:bg-accent hover:text-foreground',
    danger: 'border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20',
    success: 'border border-success/40 bg-success/10 text-success hover:bg-success/20',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`label-caps rounded-full px-4 py-2.5 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
