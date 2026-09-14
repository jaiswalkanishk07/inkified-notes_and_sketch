import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth } from '@/core/firebase/config';
import type { User } from '@/types';

function mapUser(u: FirebaseUser): User {
  return {
    uid: u.uid,
    email: u.email ?? '',
    displayName: u.displayName,
    photoURL: u.photoURL,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    settings: { theme: 'system', fontSize: 16 },
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ? mapUser(fbUser) : null);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
