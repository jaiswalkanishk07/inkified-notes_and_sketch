import { showToast } from '@/shared/components/Toaster';

// Local-only placeholder — Firebase login removed for now.
export default function LoginScreen() {
  const handleLogin = () => {
    showToast('Sign-in coming soon', 'info');
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Welcome to Inkify</h1>
        <p className="max-w-sm text-sm text-slate-500">
          Offline-first notes & sketching.
        </p>
      </div>
      <button
        onClick={handleLogin}
        className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        Sign in
      </button>
    </div>
  );
}
