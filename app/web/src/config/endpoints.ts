// config/endpoints.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for every API endpoint the web app communicates with.
// All paths are relative to the `baseURL` configured in `lib/api-client.ts`
// (e.g. http://localhost:3000/api/v1).
//
// Usage:  import { API_ENDPOINTS } from '@/config/endpoints';
//         apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload);
// ─────────────────────────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // ── Users (future) ───────────────────────────────────────────────────────
  // USERS: {
  //   LIST:        '/users',
  //   BY_ID:       (id: string) => `/users/${id}` as const,
  //   UPDATE:      (id: string) => `/users/${id}` as const,
  //   DELETE:      (id: string) => `/users/${id}` as const,
  // },

  // ── Projects (future) ────────────────────────────────────────────────────
  // PROJECTS: {
  //   LIST:        '/projects',
  //   CREATE:      '/projects',
  //   BY_ID:       (id: string) => `/projects/${id}` as const,
  //   UPDATE:      (id: string) => `/projects/${id}` as const,
  //   DELETE:      (id: string) => `/projects/${id}` as const,
  // },

  // ── Health ────────────────────────────────────────────────────────────────
  HEALTH: {
    CHECK: '/',
  },
} as const;

export default API_ENDPOINTS;
