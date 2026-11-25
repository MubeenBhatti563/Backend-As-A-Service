import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';
import { randomUUID } from 'node:crypto';

const COUNTER_PREFIX = 'usage:project:requests:';
const LOCK_KEY = 'usage:project:flush-lock';

/** Aggregates request counts in Redis and persists daily counters/sizes once per minute. */
@Injectable()
export class UsageTelemetryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UsageTelemetryService.name);
  private timer?: NodeJS.Timeout;
  private lastFailureLogAt = 0;

  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.flushSafely(), 60_000);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async recordProjectRequest(projectId: string) {
    const day = new Date().toISOString().slice(0, 10);
    const key = `${COUNTER_PREFIX}${day}:${projectId}`;
    const redis = this.redis.getClient();
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, 60 * 60 * 24 * 9);
    await pipeline.exec();
  }

  async flushSafely() {
    const client = this.redis.getClient();
    const lockToken = randomUUID();
    const lock = await client.set(LOCK_KEY, lockToken, 'EX', 300, 'NX');
    if (!lock) return;
    let stage = 'request counters';
    try {
      await this.flushCounters();
      stage = 'database size snapshot';
      const snapshotLock = await client.set('usage:project:snapshot-lock', lockToken, 'EX', 300, 'NX');
      if (snapshotLock) {
        try {
          await this.snapshotDatabaseSizes();
        } catch (error) {
          await client.eval("if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end", 1, 'usage:project:snapshot-lock', lockToken);
          throw error;
        }
      }
    } catch (cause) {
      // Keep logs useful without dumping SQL, tenant identifiers or request data.
      const error = cause instanceof Error ? cause : new Error('Unknown telemetry failure');
      if (Date.now() - this.lastFailureLogAt >= 5 * 60_000) {
        this.lastFailureLogAt = Date.now();
        this.logger.error(`Usage telemetry ${stage} failed: ${error.message}`, error.stack);
      }
    } finally {
      await client.eval("if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end", 1, LOCK_KEY, lockToken);
    }
  }

  private async flushCounters() {
    const redis = this.redis.getClient();
    let cursor = '0';
    do {
      const [next, keys] = await redis.scan(cursor, 'MATCH', `${COUNTER_PREFIX}*`, 'COUNT', 100);
      cursor = next;
      for (const key of keys) {
        const count = await redis.getset(key, '0');
        if (!count) continue;
        await redis.expire(key, 60 * 60 * 24 * 9);
        const [, day, projectId] = key.slice(COUNTER_PREFIX.length).split(':');
        if (!day || !projectId) continue;
        const dayDate = new Date(`${day}T00:00:00.000Z`);
        const periodStart = new Date(Date.UTC(dayDate.getUTCFullYear(), dayDate.getUTCMonth(), 1));
        const periodEnd = new Date(Date.UTC(dayDate.getUTCFullYear(), dayDate.getUTCMonth() + 1, 1));
        try {
          await this.prisma.$transaction([
            this.prisma.projectUsageDaily.upsert({
              where: { projectId_day: { projectId, day: dayDate } },
              create: { projectId, day: dayDate, apiRequests: BigInt(count) },
              update: { apiRequests: { increment: BigInt(count) } },
            }),
            this.prisma.projectUsage.upsert({
              where: { projectId_periodStart: { projectId, periodStart } },
              create: { projectId, periodStart, periodEnd, apiRequests: BigInt(count) },
              update: { apiRequests: { increment: BigInt(count) } },
            }),
          ]);
          await redis.eval("if redis.call('GET', KEYS[1]) == '0' then return redis.call('DEL', KEYS[1]) else return 0 end", 1, key);
        } catch (error) {
          await redis.incrby(key, count);
          throw error;
        }
      }
    } while (cursor !== '0');
  }

  private async snapshotDatabaseSizes() {
    const projects = await this.prisma.project.findMany({
      where: { status: { in: ['ACTIVE', 'PENDING'] } },
      select: { id: true, schemaName: true },
    });
    if (projects.length === 0) return;

    const sizeRows = await this.prisma.$queryRawUnsafe<Array<{ schema_name: string; bytes: bigint }>>(
      `SELECT n.nspname AS schema_name, COALESCE(SUM(pg_total_relation_size(c.oid)), 0)::bigint AS bytes
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE c.relkind IN ('r', 'p')
       GROUP BY n.nspname`,
    );
    const sizeMap = new Map(sizeRows.map((r) => [r.schema_name, BigInt(r.bytes)]));

    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    const periodStart = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
    const periodEnd = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 1));

    for (const project of projects) {
      const bytes = sizeMap.get(project.schemaName) ?? 0n;
      await this.prisma.$transaction([
        this.prisma.projectUsageDaily.upsert({
          where: { projectId_day: { projectId: project.id, day } },
          create: { projectId: project.id, day, dbBytes: bytes },
          update: { dbBytes: bytes },
        }),
        this.prisma.projectUsage.upsert({
          where: { projectId_periodStart: { projectId: project.id, periodStart } },
          create: { projectId: project.id, periodStart, periodEnd, dbBytes: bytes },
          update: { dbBytes: bytes },
        }),
      ]);
    }
  }

}
