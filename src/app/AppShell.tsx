import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Toaster } from '@/shared/components/Toaster';
import { usePWAInstall } from '@/core/pwa/usePWAInstall';
import { useTheme, type Theme } from '@/shared/hooks/useTheme';

interface AppShellProps {
  children: ReactNode;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

function effectiveDark(theme: Theme): boolean {
  return theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function AppShell({ children }: AppShellProps) {
  const { canInstall, promptInstall } = usePWAInstall();
  const { theme, setTheme } = useTheme();
  const isDark = effectiveDark(theme);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <aside className="hidden w-48 shrink-0 border-r border-slate-200 p-3 dark:border-slate-700 md:block">
        <h1 className="mb-4 text-lg font-bold tracking-tight">Inkify</h1>
        <nav className="flex flex-col gap-1">
          <NavLink to="/notes" end className={navLinkClass}>
            Notes
          </NavLink>
          <NavLink to="/notes/new" className={navLinkClass}>
            New Note
          </NavLink>
          <NavLink to="/sketch/new" className={navLinkClass}>
            Sketch
          </NavLink>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
          <span className="font-bold md:hidden">Inkify</span>
          <div className="ml-auto flex items-center gap-2">
            {canInstall && (
              <button
                onClick={() => void promptInstall()}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Install
              </button>
            )}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {isDark ? '☀' : '🌙'}
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
