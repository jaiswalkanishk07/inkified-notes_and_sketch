import { type ReactNode } from 'react';
import { Toaster } from '@/shared/components/Toaster';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-lg font-bold tracking-tight">Inkify</h1>
        <span className="text-xs text-slate-400">v0.0.0</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            Starter
          </span>
        </div>
      </header>
      <main className="p-6">{children}</main>
      <Toaster />
    </div>
  );
}
