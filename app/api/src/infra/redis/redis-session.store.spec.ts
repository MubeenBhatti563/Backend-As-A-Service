import type { SessionStore } from '@fastify/session';
import { RedisService } from './redis.service';
import { RedisSessionStore } from './redis-session.store';

type StoredSession = Parameters<SessionStore['set']>[1];

describe('RedisSessionStore', () => {
  const evalMock = jest.fn();
  const redisMock = {
    getClient: () => ({ eval: evalMock }),
  };
  let store: RedisSessionStore;

  beforeEach(() => {
    jest.clearAllMocks();
    store = new RedisSessionStore(redisMock as unknown as RedisService);
  });

  it('updates a session only when its generation still matches', async () => {
    evalMock.mockResolvedValue(1);
    const session = {
      cookie: { expires: null },
      __fastifySessionMetadata: { generation: 'new-generation' },
    } as StoredSession;
    const callback = jest.fn();

    store.compareAndSet('session-id', 'old-generation', session, callback);
    await Promise.resolve();

    expect(evalMock).toHaveBeenCalledWith(
      expect.stringContaining("generation ~= ARGV[1]"),
      1,
      'sess:session-id',
      'old-generation',
      JSON.stringify(session),
      '604800',
      'session-id',
    );
    expect(callback).toHaveBeenCalledWith();
  });

  it('returns ENOENT when the session was revoked or changed', async () => {
    evalMock.mockResolvedValue(0);
    const callback = jest.fn();

    store.compareAndSet(
      'session-id',
      'old-generation',
      { cookie: { expires: null } } as StoredSession,
      callback,
    );
    await Promise.resolve();

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'ENOENT' }),
    );
  });
});
