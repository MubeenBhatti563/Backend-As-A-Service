import apiClient from '@/lib/api-client';
import type {
  ApiResponse,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  SafeUser,
  VerifyEmailInput,
} from '@baas/types';

export const authApi = {
  /**
   * Register a new user account
   */
  register: async (payload: RegisterInput): Promise<ApiResponse<SafeUser>> => {
    return (await apiClient.post('/auth/register', payload)) as unknown as ApiResponse<SafeUser>;
  },

  /**
   * Login with email and password
   */
  login: async (payload: LoginInput): Promise<ApiResponse<SafeUser>> => {
    return (await apiClient.post('/auth/login', payload)) as unknown as ApiResponse<SafeUser>;
  },

  /**
   * Fetch current authenticated user's profile
   */
  getMe: async (): Promise<ApiResponse<SafeUser>> => {
    return (await apiClient.get('/auth/me')) as unknown as ApiResponse<SafeUser>;
  },

  /**
   * Request an email verification link
   */
  resendVerification: async (
    payload: ResendVerificationInput,
  ): Promise<ApiResponse<null>> => {
    return (await apiClient.post(
      '/auth/resend-verification',
      payload,
    )) as unknown as ApiResponse<null>;
  },

  /**
   * Verify email address using the token received in email
   */
  verifyEmail: async (
    payload: VerifyEmailInput,
  ): Promise<ApiResponse<null>> => {
    return (await apiClient.post(
      '/auth/verify-email',
      payload,
    )) as unknown as ApiResponse<null>;
  },

  /**
   * Request password reset link for forgotten password
   */
  forgotPassword: async (
    payload: ForgotPasswordInput,
  ): Promise<ApiResponse<null>> => {
    return (await apiClient.post(
      '/auth/forgot-password',
      payload,
    )) as unknown as ApiResponse<null>;
  },

  /**
   * Reset password using the reset token
   */
  resetPassword: async (
    payload: ResetPasswordInput,
  ): Promise<ApiResponse<null>> => {
    return (await apiClient.post(
      '/auth/reset-password',
      payload,
    )) as unknown as ApiResponse<null>;
  },

  /**
   * Logout from current active session
   */
  logout: async (): Promise<ApiResponse<null>> => {
    return (await apiClient.post('/auth/logout')) as unknown as ApiResponse<null>;
  },

  /**
   * Logout from all active devices/sessions
   */
  logoutAll: async (): Promise<ApiResponse<null>> => {
    return (await apiClient.post('/auth/logout-all')) as unknown as ApiResponse<null>;
  },
};

export default authApi;
