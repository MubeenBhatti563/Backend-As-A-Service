// stores/auth.store.ts
// ─────────────────────────────────────────────────────────────────────────────
// Zustand store for client-side auth state.
//
// WHY Zustand alongside TanStack Query?
// • TanStack Query is the server-state cache  → fetches /auth/me, handles
//   staleness, background refetches, and error retries.
// • Zustand is the client-state store → provides synchronous, render-safe
//   access to `user`, `isAuthenticated`, and `status` across any component
//   without prop-drilling or context providers.
//
// The two are bridged via `useAuthSync()` (see providers/AuthProvider.tsx):
// whenever TanStack Query resolves the /me query, the result is pushed into
// this Zustand store so the rest of the app can `useAuthStore(s => s.user)`
// synchronously.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import type { SafeUser } from '@baas/types';

// ── Types ───────────────────────────────────────────────────────────────────

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  /** The current user's profile, or null when logged out / unknown. */
  user: SafeUser | null;

  /** High-level auth lifecycle status for UI branching. */
  status: AuthStatus;

  /** Convenience boolean — equivalent to `status === 'authenticated'`. */
  isAuthenticated: boolean;
}

export interface AuthActions {
  /** Set user + status after a successful /me fetch or login. */
  setUser: (user: SafeUser) => void;

  /** Clear user state on logout or 401 response. */
  clearUser: () => void;

  /** Transition to the loading state (initial hydration). */
  setLoading: () => void;

  /** Transition to the idle state (before any fetch). */
  setIdle: () => void;
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  // ── Initial state ──
  user: null,
  status: 'idle',
  isAuthenticated: false,

  // ── Actions ──
  setUser: (user) =>
    set({
      user,
      status: 'authenticated',
      isAuthenticated: true,
    }),

  clearUser: () =>
    set({
      user: null,
      status: 'unauthenticated',
      isAuthenticated: false,
    }),

  setLoading: () =>
    set({
      status: 'loading',
    }),

  setIdle: () =>
    set({
      user: null,
      status: 'idle',
      isAuthenticated: false,
    }),
}));

// ── Selectors (for fine-grained re-renders) ─────────────────────────────────

export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectAuthStatus = (s: AuthState) => s.status;
