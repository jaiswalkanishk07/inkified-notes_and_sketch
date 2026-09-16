import { useEffect, useState } from 'react';
import type { User } from '@/types';

// Local-only auth placeholder — Firebase removed for now.
// Will be replaced with a proper login provider in a later stage.
export function useAuth() {
  const [user] = useState<User | null>(null);
  const [loading] = useState(false);

  useEffect(() => {}, []);

  return { user, loading };
}
