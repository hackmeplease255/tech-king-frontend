'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api/client';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getToken() ? '/dashboard' : '/login');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-slate-400">Loading Tech King Automation…</p>
      </div>
    </div>
  );
}
