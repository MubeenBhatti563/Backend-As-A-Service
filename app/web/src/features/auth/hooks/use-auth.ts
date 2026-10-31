import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authApi from '../api/auth.api';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  SafeUser,
  VerifyEmailInput,
} from '@baas/types';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';

export const AUTH_KEYS = {
  all: ['auth'] as const,
  currentUser: () => [...AUTH_KEYS.all, 'currentUser'] as const,
};

/**
 * Hook to retrieve current logged in user session.
 */
export function useCurrentUser() {
  return useQuery<SafeUser, ApiError>({
    queryKey: AUTH_KEYS.currentUser(),
    queryFn: async () => {
      const response = await authApi.getMe();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Do not retry if unauthorized (guest user)
  });
}

/**
 * Hook to perform user login.
 * Syncs both TanStack Query cache and Zustand store on success.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: LoginInput) => authApi.login(payload),
    onSuccess: (response) => {
      const user = response.data;
      queryClient.setQueryData(AUTH_KEYS.currentUser(), user);
      setUser(user);
    },
  });
}

/**
 * Hook to register a new user.
 */
export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterInput) => authApi.register(payload),
  });
}

/**
 * Hook to logout from the current session.
 * Clears both TanStack Query cache and Zustand store on success.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((s) => s.clearUser);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearUser();
      queryClient.setQueryData(AUTH_KEYS.currentUser(), null);
      queryClient.removeQueries({ queryKey: AUTH_KEYS.all });
    },
  });
}

/**
 * Hook to logout from all active sessions.
 * Clears both TanStack Query cache and Zustand store on success.
 */
export function useLogoutAll() {
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((s) => s.clearUser);

  return useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => {
      clearUser();
      queryClient.setQueryData(AUTH_KEYS.currentUser(), null);
      queryClient.removeQueries({ queryKey: AUTH_KEYS.all });
    },
  });
}

/**
 * Hook to request password reset link.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordInput) =>
      authApi.forgotPassword(payload),
  });
}

/**
 * Hook to reset password using token.
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordInput) => authApi.resetPassword(payload),
  });
}

/**
 * Hook to verify email with token.
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyEmailInput) => authApi.verifyEmail(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.currentUser() });
    },
  });
}

/**
 * Hook to resend verification email.
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: (payload: ResendVerificationInput) =>
      authApi.resendVerification(payload),
  });
}
