export const DB_QUEUE = 'db';

export const DB_JOBS = {
  createDb: 'create-new-tenant',
} as const;

export type DBJobName = (typeof DB_JOBS)[keyof typeof DB_JOBS];
