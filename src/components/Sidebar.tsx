'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/sessions', label: 'Sessions', icon: '💬' },
  { href: '/pair', label: 'Pair WhatsApp', icon: '🔗' },
  { href: '/plugins', label: 'Plugins', icon: '🧩' },
  { href: '/customers', label: 'Customers', icon: '👥' },
  { href: '/broadcasts', label: 'Broadcasts', icon: '📣' },
  { href: '/automations', label: 'Automations', icon: '⚡' },
  { href: '/ai', label: 'AI', icon: '🤖' },
  { href: '/api', label: 'API Keys', icon: '🔑' },
  { href: '/logs', label: 'Logs', icon: '📜' },
  { href: '/health', label: 'Health', icon: '🩺' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-800 bg-slate-900/40">
      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-sm font-bold text-white">🤖 TECH KING</p>
        <p className="text-[11px] text-slate-500">AUTOMATION</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? 'bg-brand-600/20 text-brand-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 px-5 py-4">
        <p className="truncate text-sm font-medium text-slate-200">{user?.name ?? '…'}</p>
        <p className="mb-2 truncate text-xs text-slate-500">{user?.email ?? ''}</p>
        <button onClick={logout} className="btn-secondary w-full text-xs">
          Sign out
        </button>
      </div>
    </aside>
  );
}
