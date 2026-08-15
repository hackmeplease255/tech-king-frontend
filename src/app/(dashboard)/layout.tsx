'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="neon-fill grid size-12 place-items-center rounded-2xl font-display text-xl font-bold">
          TK
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 lg:flex-row">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile drawer */}
        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close navigation"
              onClick={() => setNavOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <div className="absolute left-0 top-0 h-full w-[19rem] max-w-[85vw] p-3">
              <Sidebar />
            </div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <TopBar onMenu={() => setNavOpen((v) => !v)} />
          {children}
          <footer className="label-caps py-4 text-center text-muted-foreground/60">
            Tech King Automation — built for operators
          </footer>
        </main>
      </div>
    </div>
  );
}
