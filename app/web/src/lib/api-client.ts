import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '@baas/types';

/**
 * Custom application API error wrapping the standardized server error envelope.
 */
export class ApiError extends Error {
  statusCode: number;
  error: string;
  errors?: unknown;
  path?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    error: string = 'Internal Server Error',
    errors?: unknown,
    path?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
    this.errors = errors;
    this.path = path;
  }
}

const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return 'http://localhost:3000/api/v1';
};

/**
 * Pre-configured Axios client instance for communication with the NestJS API.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // Crucial for cookie-based Fastify session persistence
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach dynamic headers or request metadata if needed
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Response interceptor: unwrap standard ApiResponse envelope and normalize errors
apiClient.interceptors.response.use(
  (response) => {
    // Return response.data directly (which conforms to ApiResponse<T>)
    return response.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data) {
      const { message, statusCode, error: errTitle, errors, path } =
        error.response.data;

      // Extract single or formatted error message for display in form alerts
      let displayMessage = message;
      if (Array.isArray(errors) && errors.length > 0) {
        const firstError = errors[0];
        if (typeof firstError === 'string') {
          displayMessage = firstError;
        } else if (typeof firstError === 'object' && firstError !== null && 'message' in firstError) {
          displayMessage = (firstError as { message: string }).message;
        }
      }

      return Promise.reject(
        new ApiError(
          displayMessage || error.message || 'An error occurred',
          statusCode || error.response.status,
          errTitle || 'Error',
          errors,
          path,
        ),
      );
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new ApiError(
          'Request timed out. Please try again.',
          408,
          'Timeout',
        ),
      );
    }

    if (!error.response) {
      return Promise.reject(
        new ApiError(
          'Unable to connect to the server. Please check your internet connection.',
          0,
          'Network Error',
        ),
      );
    }

    return Promise.reject(
      new ApiError(
        error.message || 'An unexpected error occurred',
        error.response.status,
      ),
    );
  },
);

export default apiClient;
