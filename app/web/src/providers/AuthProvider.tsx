// providers/AuthProvider.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Bridges TanStack Query (server state) ↔ Zustand (client state).
//
// On mount it fires `useCurrentUser()` (TanStack Query) to fetch /auth/me.
// Whenever the query resolves — success or error — it pushes the result into
// the Zustand `useAuthStore` so every component in the app can synchronously
// read `user`, `isAuthenticated`, and `status` without awaiting a query.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useEffect } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading, isError, isSuccess } = useCurrentUser();

  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    if (isLoading) {
      setLoading();
      return;
    }

    if (isSuccess && user) {
      setUser(user);
      return;
    }

    if (isError || (isSuccess && !user)) {
      clearUser();
    }
  }, [isLoading, isSuccess, isError, user, setUser, clearUser, setLoading]);

  return <>{children}</>;
}

export default AuthProvider;
