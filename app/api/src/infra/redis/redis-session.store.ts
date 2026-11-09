import { SessionStore } from '@fastify/session';
import { RedisService } from './redis.service';

type StoredSession = Parameters<SessionStore['set']>[1];

export const SESSION_PREFIX = 'sess:';
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;
const COMPARE_AND_SET_SCRIPT = `
local stored = redis.call('GET', KEYS[1])
if not stored then
  return 0
end

local session = cjson.decode(stored)
local metadata = session['__fastifySessionMetadata']
local generation = metadata and metadata['generation'] or ARGV[4]
if generation ~= ARGV[1] then
  return 0
end

redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
return 1
`;

export class RedisSessionStore implements SessionStore {
  constructor(private readonly redis: RedisService) {}

  private key(id: string) {
    return `${SESSION_PREFIX}${id}`;
  }

  private ttl(session: StoredSession): number {
    const expires = session.cookie?.expires;
    if (!expires) return DEFAULT_TTL_SECONDS;
    const seconds = Math.ceil(
      (new Date(expires).getTime() - Date.now()) / 1000,
    );
    return Math.max(seconds, 1);
  }

  set(id: string, session: StoredSession, callback: (err?: unknown) => void) {
    this.redis
      .set(this.key(id), session, this.ttl(session))
      .then(() => callback(), callback);
  }

  compareAndSet(
    id: string,
    expectedGeneration: string,
    session: StoredSession,
    callback: (err?: unknown) => void,
  ) {
    this.redis
      .getClient()
      .eval(
        COMPARE_AND_SET_SCRIPT,
        1,
        this.key(id),
        expectedGeneration,
        JSON.stringify(session),
        String(this.ttl(session)),
        id,
      )
      .then((result) => {
        if (result === 1) {
          callback();
          return;
        }

        callback(
          Object.assign(new Error('The session does not exist or has changed'), {
            code: 'ENOENT',
          }),
        );
      }, callback);
  }

  get(
    id: string,
    callback: (err: unknown, result?: StoredSession | null) => void,
  ) {
    this.redis.get<StoredSession>(this.key(id)).then(
      (session) => callback(null, session),
      (err) => callback(err),
    );
  }

  destroy(id: string, callback: (err?: unknown) => void) {
    this.redis.del(this.key(id)).then(() => callback(), callback);
  }
}
