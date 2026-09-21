import { useEffect, useState } from 'react';
import type { User } from '@/types';

// Local-first mode: no cloud auth yet. A stable local guest identity lets the
// app work in the browser with everything persisted in Dexie/IndexedDB.
// Swap for a real provider when a backend is introduced.
const GUEST_USER: User = {
  uid: 'local-guest',
  email: 'guest@local',
  displayName: 'Guest',
  photoURL: null,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  settings: { theme: 'system', fontSize: 16 },
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(GUEST_USER);
  const [loading] = useState(false);

  useEffect(() => {
    // Future: subscribe to real auth provider here.
    setUser(GUEST_USER);
  }, []);

  return { user, loading };
}
