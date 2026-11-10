import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/endpoints";
import type {
  ApiResponse,
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  SafeUser,
  UserSession,
  VerifyEmailInput,
} from "@baas/types";

const { AUTH } = API_ENDPOINTS;

export const authApi = {
  /**
   * Register a new user account
   */
  register: async (payload: RegisterInput): Promise<ApiResponse<SafeUser>> => {
    return (await apiClient.post(
      AUTH.REGISTER,
      payload,
    )) as unknown as ApiResponse<SafeUser>;
  },

  /**
   * Login with email and password
   */
  login: async (payload: LoginInput): Promise<ApiResponse<SafeUser>> => {
    return (await apiClient.post(
      AUTH.LOGIN,
      payload,
    )) as unknown as ApiResponse<SafeUser>;
  },

  /**
   * Fetch current authenticated user's profile
   */
  getMe: async (): Promise<ApiResponse<SafeUser>> => {
    return (await apiClient.get(AUTH.ME)) as unknown as ApiResponse<SafeUser>;
  },

  /**
   * Request an email verification link
   */
  resendVerification: async (
    payload: ResendVerificationInput,
  ): Promise<ApiResponse<null>> => {
    return (await apiClient.post(
      AUTH.RESEND_VERIFICATION,
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
      AUTH.VERIFY_EMAIL,
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
      AUTH.FORGOT_PASSWORD,
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
      AUTH.RESET_PASSWORD,
      payload,
    )) as unknown as ApiResponse<null>;
  },

  /**
   * Change password for the authenticated user
   */
  changePassword: async (
    payload: ChangePasswordInput,
  ): Promise<ApiResponse<{ message: string }>> => {
    return (await apiClient.post(
      AUTH.CHANGE_PASSWORD,
      payload,
    )) as unknown as ApiResponse<{ message: string }>;
  },

  /**
   * Logout from current active session
   */
  logout: async (): Promise<ApiResponse<null>> => {
    return (await apiClient.post(AUTH.LOGOUT)) as unknown as ApiResponse<null>;
  },

  /**
   * Logout from all active devices/sessions
   */
  logoutAll: async (): Promise<ApiResponse<null>> => {
    return (await apiClient.post(
      AUTH.LOGOUT_ALL,
    )) as unknown as ApiResponse<null>;
  },

  /**
   * Get all sessions
   */
  getAllSessions: async (): Promise<ApiResponse<UserSession[]>> => {
    return (await apiClient.get(
      AUTH.GET_ALL_SESSION,
    )) as unknown as ApiResponse<UserSession[]>;
  },

  revokeSession: async (
    sessionId: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    return (await apiClient.post(
      AUTH.REVOKE_SESSION(sessionId),
    )) as unknown as ApiResponse<{ message: string }>;
  },

  revokeOtherSessions: async (): Promise<ApiResponse<{ message: string }>> => {
    return (await apiClient.post(
      AUTH.REVOKE_OTHER_SESSIONS,
    )) as unknown as ApiResponse<{ message: string }>;
  },
};

export default authApi;
