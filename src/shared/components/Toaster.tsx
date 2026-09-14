import { useEffect, useState } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

let toastId = 0;
const listeners = new Set<(t: Toast) => void>();

export function showToast(message: string, type: Toast['type'] = 'info') {
  const toast: Toast = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(toast));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 4000);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-4 py-2 text-sm text-white shadow-lg ${
            t.type === 'success'
              ? 'bg-green-600'
              : t.type === 'error'
                ? 'bg-red-600'
                : 'bg-slate-800'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
