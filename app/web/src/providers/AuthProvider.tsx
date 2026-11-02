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

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/config/routes';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError, isSuccess } = useCurrentUser();

  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Track if user was authenticated during this session
  const hadAuthRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      hadAuthRef.current = true;
    }
  }, [isAuthenticated]);

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
      const wasAuth = hadAuthRef.current;
      clearUser();

      // If user had an active session that expired (401), or is on a protected route:
      const isAuthPage = pathname.startsWith('/auth');
      const isProtected = pathname.startsWith('/dashboard');

      if ((wasAuth || isProtected) && !isAuthPage) {
        router.push(ROUTES.sessionExpired);
      }
    }
  }, [isLoading, isSuccess, isError, user, setUser, clearUser, setLoading, pathname, router]);

  return <>{children}</>;
}

export default AuthProvider;
