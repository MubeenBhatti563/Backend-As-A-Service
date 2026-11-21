export const SESSION_PREFIX = 'sess:';
export const SHORT_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours (unremembered login)
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (default session)
export const REMEMBER_ME_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (remember me)

export const DEFAULT_SESSION_TTL_MS = REMEMBER_ME_TTL_MS;
export const DEFAULT_SESSION_TTL_SECONDS = Math.floor(
  DEFAULT_SESSION_TTL_MS / 1000,
);
