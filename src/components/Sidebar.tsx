'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Bot,
  Download,
  KeyRound,
  LayoutGrid,
  LogOut,
  Network,
  Settings,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/sessions', label: 'Sessions', icon: Bot },
  { href: '/pair', label: 'Connect Device', icon: Network },
  { href: '/plugins', label: 'Configurations', icon: SlidersHorizontal },
  { href: '/customers', label: 'Customers', icon: Activity },
  { href: '/broadcasts', label: 'Broadcasts', icon: Sparkles },
  { href: '/automations', label: 'Automations', icon: KeyRound },
  { href: '/health', label: 'Deployments', icon: Network },
  { href: '/api', label: 'API Keys', icon: KeyRound },
  { href: '/logs', label: 'Notifications', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <aside className="glass-panel flex h-full w-full flex-col gap-1 overflow-hidden rounded-3xl p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72">
      <div className="flex items-center gap-3 px-2 pb-4">
        <div className="neon-fill grid size-10 place-items-center rounded-2xl font-display text-lg font-bold">
          TK
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-tight text-foreground">TECH KING</p>
          <p className="label-caps text-muted-foreground">Automation</p>
        </div>
      </div>

      <p className="label-caps px-2 pb-3 italic text-success">
        {user ? `Signed in · ${user.name}` : 'Securely connected'}
      </p>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-full px-3 py-2.5 text-left transition-all ${
                active
                  ? 'neon-fill'
                  : 'bg-surface-2/60 text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="label-caps">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="mt-2 flex items-center gap-3 rounded-full border border-danger/40 bg-danger/10 px-3 py-2.5 text-danger transition-colors hover:bg-danger/20"
      >
        <LogOut className="size-4" />
        <span className="label-caps">Logout</span>
      </button>

      <div className="mt-2 flex items-center gap-3 rounded-full border border-primary/40 bg-primary/10 px-3 py-2.5 text-primary">
        <Download className="size-4" />
        <span className="label-caps">Install App</span>
      </div>
    </aside>
  );
}
