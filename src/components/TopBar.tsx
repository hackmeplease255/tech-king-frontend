'use client';

import { Bell, LogOut, Menu, Search, Sprout } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="glass-panel flex items-center gap-3 rounded-3xl px-4 py-3">
      <button
        onClick={onMenu}
        className="grid size-9 place-items-center rounded-xl bg-surface-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="size-4" />
      </button>

      <div className="hidden flex-1 items-center gap-2 rounded-full bg-surface-2/70 px-4 py-2 md:flex">
        <Search className="size-4 text-muted-foreground" />
        <input
          placeholder="Search sessions, customers, deployments…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-full bg-surface-2 p-1">
          <span className="label-caps rounded-full bg-accent px-2.5 py-1 text-foreground">TZ</span>
          <span className="label-caps px-2.5 py-1 text-muted-foreground">EN</span>
        </div>
        <button
          className="relative grid size-9 place-items-center rounded-full bg-surface-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
        </button>
        <div className="hidden items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-2 sm:flex">
          <Sprout className="size-4 text-success" />
          <span className="label-caps text-success">Pioneer</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-full border border-danger/40 bg-danger/10 px-3 py-2 text-danger transition-colors hover:bg-danger/20"
        >
          <LogOut className="size-4" />
          <span className="label-caps hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
