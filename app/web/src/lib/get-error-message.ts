/**
 * Extracts a human-readable error message from any thrown value.
 *
 * Priority order:
 *  1. `ApiError.message`  — set by the axios interceptor directly from the
 *     backend's JSON error envelope (`{ message, statusCode, error, errors }`)
 *  2. Generic `Error.message`
 *  3. Plain string throws
 *  4. Fallback copy
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}
