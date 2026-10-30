/**
 * Standard successful response envelope returned by the BaaS API.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

/**
 * Detailed error item for field validation failures.
 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
  [key: string]: unknown;
}

/**
 * Standard error response envelope returned by the BaaS API.
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  errors?: ApiErrorDetail[] | string[] | Record<string, unknown>;
  timestamp: string;
  path: string;
  stack?: string;
}

/**
 * Common pagination metadata.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated data response.
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
