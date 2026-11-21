import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { generateSecurePassword } from '@baas/crypto-utils';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { DB_JOBS, DB_QUEUE } from './db.constants';
import { CreateNewTenant } from './db.interfaces';

const IDENTIFIER_REGEX = /^[a-z0-9_]+$/i;

export function assertValidIdentifier(identifier: string, fieldName: string = 'identifier'): void {
  if (!identifier || typeof identifier !== 'string' || !IDENTIFIER_REGEX.test(identifier)) {
    throw new Error(
      `Invalid SQL ${fieldName}: "${identifier}". Identifiers must match allowlist pattern ${IDENTIFIER_REGEX.toString()}.`,
    );
  }
}

@Processor(DB_QUEUE)
export class DBProcessor extends WorkerHost {
  private readonly logger = new Logger(DBProcessor.name);

  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.debug(
      `Processing DB job ${job.id} of type "${job.name}" (attempt ${job.attemptsMade + 1})`,
    );

    switch (job.name) {
      case DB_JOBS.createDb: {
        const { projectId, schemaName, dbRole } =
          job.data as CreateNewTenant;
        // Secure server-side credential generation (never passed through BullMQ payload)
        const dbPassword = generateSecurePassword(24);
        await this.createNewTenant(projectId, schemaName, dbRole, dbPassword);
        break;
      }

      default:
        this.logger.warn(`Unrecognized DB job name: ${job.name}`);
        break;
    }
  }

  /**
   * Provisions a new PostgreSQL tenant:
   *   1. Validate identifier allowlist to prevent SQL injection
   *   2. CREATE ROLE with LOGIN and server-side generated password
   *   3. CREATE SCHEMA owned by that role
   *   4. GRANT all privileges on the schema to the role
   *   5. Set the role's default search_path
   *   6. Seed default tables (users, profiles, storage_objects)
   *   7. Mark the project ACTIVE in Prisma
   *
   * NOTE: CREATE ROLE and CREATE SCHEMA are DDL statements that cannot run
   * inside a Prisma interactive transaction. We execute them sequentially and
   * rely on BullMQ's retry + exponential-backoff to handle partial failures.
   */
  async createNewTenant(
    projectId: string,
    schemaName: string,
    dbRole: string,
    dbPassword?: string,
  ): Promise<void> {
    // ── Input Validation / SQL Injection Prevention ────────────────────────
    assertValidIdentifier(schemaName, 'schemaName');
    assertValidIdentifier(dbRole, 'dbRole');

    const password = dbPassword ?? generateSecurePassword(24);
    assertValidIdentifier(password, 'dbPassword');

    this.logger.log(
      `Provisioning tenant — project: ${projectId}, schema: "${schemaName}", role: "${dbRole}"`,
    );

    // ── Step 1: CREATE ROLE ────────────────────────────────────────────────
    await this.prismaService.$executeRawUnsafe(
      `CREATE ROLE "${dbRole}" WITH LOGIN PASSWORD '${password}';`,
    );
    this.logger.debug(`Role "${dbRole}" created`);

    await this.prismaService.$executeRawUnsafe(
      `REVOKE ALL ON SCHEMA public FROM "${dbRole}";`,
    );

    // ── Step 2: CREATE SCHEMA ──────────────────────────────────────────────
    await this.prismaService.$executeRawUnsafe(
      `CREATE SCHEMA "${schemaName}" AUTHORIZATION "${dbRole}";`,
    );
    this.logger.debug(`Schema "${schemaName}" created`);

    // ── Step 3: GRANT privileges ───────────────────────────────────────────
    await this.prismaService.$executeRawUnsafe(
      `GRANT ALL PRIVILEGES ON SCHEMA "${schemaName}" TO "${dbRole}";`,
    );
    this.logger.debug(`Privileges granted on "${schemaName}" to "${dbRole}"`);

    // ── Step 4: Set default search_path for the role ───────────────────────
    await this.prismaService.$executeRawUnsafe(
      `ALTER ROLE "${dbRole}" SET search_path TO "${schemaName}";`,
    );
    this.logger.debug(`search_path set to "${schemaName}" for "${dbRole}"`);

    // ── Step 5: Seed default tables ────────────────────────────────────────
    await this.seedTenantSchema(schemaName, dbRole);
    this.logger.debug(`Default tables seeded in schema "${schemaName}"`);

    // ── Step 6: Mark project ACTIVE ────────────────────────────────────────
    await this.prismaService.project.update({
      where: { id: projectId },
      data: { status: 'ACTIVE' },
    });

    this.logger.log(
      `Tenant provisioned and project ${projectId} is now ACTIVE`,
    );
  }

  /**
   * Seeds every new tenant schema with the standard tables that every project
   * gets out of the box:
   *
   *  ┌─────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
   *  │     users        │────▶│    profiles      │     │   storage_objects    │
   *  │  (auth layer)   │     │ (public profile) │     │  (file metadata)     │
   *  └─────────────────┘     └──────────────────┘     └──────────────────────┘
   */
  private async seedTenantSchema(
    schemaName: string,
    dbRole: string,
  ): Promise<void> {
    assertValidIdentifier(schemaName, 'schemaName');
    assertValidIdentifier(dbRole, 'dbRole');
    // ── users ──────────────────────────────────────────────────────────────
    // Core auth table. Consumers call /auth/register to populate this.
    await this.prismaService.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}"."users" (
        "id"                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        "email"             VARCHAR(255)  NOT NULL,
        "password_hash"     VARCHAR(255),
        "role"              VARCHAR(50)   NOT NULL DEFAULT 'authenticated',
        "is_verified"       BOOLEAN       NOT NULL DEFAULT FALSE,
        "metadata"          JSONB         NOT NULL DEFAULT '{}',
        "last_sign_in_at"   TIMESTAMPTZ,
        "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "users_email_unique" UNIQUE ("email")
      );
    `);

    await this.prismaService.$executeRawUnsafe(`
      COMMENT ON TABLE "${schemaName}"."users"
        IS 'Tenant auth users managed by the BaaS auth layer.';
    `);

    await this.prismaService.$executeRawUnsafe(`
      CREATE INDEX "users_email_idx"
        ON "${schemaName}"."users" ("email");
    `);

    await this.prismaService.$executeRawUnsafe(`
      CREATE INDEX "users_role_idx"
        ON "${schemaName}"."users" ("role");
    `);

    // updated_at trigger for users
    await this.prismaService.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION "${schemaName}"."set_updated_at"()
      RETURNS TRIGGER LANGUAGE plpgsql AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$;
    `);

    await this.prismaService.$executeRawUnsafe(`
      CREATE TRIGGER "users_set_updated_at"
        BEFORE UPDATE ON "${schemaName}"."users"
        FOR EACH ROW EXECUTE FUNCTION "${schemaName}"."set_updated_at"();
    `);

    // ── profiles ───────────────────────────────────────────────────────────
    // Public user data that can be safely exposed via API without leaking auth fields.
    await this.prismaService.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}"."profiles" (
        "id"           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"      UUID          NOT NULL,
        "display_name" VARCHAR(100),
        "avatar_url"   TEXT,
        "bio"          TEXT,
        "website"      VARCHAR(255),
        "metadata"     JSONB         NOT NULL DEFAULT '{}',
        "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "profiles_user_id_fk"
          FOREIGN KEY ("user_id")
          REFERENCES "${schemaName}"."users" ("id")
          ON DELETE CASCADE,
        CONSTRAINT "profiles_user_id_unique" UNIQUE ("user_id")
      );
    `);

    await this.prismaService.$executeRawUnsafe(`
      COMMENT ON TABLE "${schemaName}"."profiles"
        IS 'Public profile data for each tenant user. 1-to-1 with users.';
    `);

    await this.prismaService.$executeRawUnsafe(`
      CREATE INDEX "profiles_user_id_idx"
        ON "${schemaName}"."profiles" ("user_id");
    `);

    await this.prismaService.$executeRawUnsafe(`
      CREATE TRIGGER "profiles_set_updated_at"
        BEFORE UPDATE ON "${schemaName}"."profiles"
        FOR EACH ROW EXECUTE FUNCTION "${schemaName}"."set_updated_at"();
    `);

    // ── storage_objects ────────────────────────────────────────────────────
    // Tracks metadata for every file uploaded to this project's storage.
    await this.prismaService.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}"."storage_objects" (
        "id"           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        "bucket"       VARCHAR(100)  NOT NULL DEFAULT 'default',
        "path"         TEXT          NOT NULL,
        "size_bytes"   BIGINT        NOT NULL DEFAULT 0,
        "mime_type"    VARCHAR(127),
        "owner_id"     UUID,
        "is_public"    BOOLEAN       NOT NULL DEFAULT FALSE,
        "metadata"     JSONB         NOT NULL DEFAULT '{}',
        "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "storage_objects_bucket_path_unique" UNIQUE ("bucket", "path"),
        CONSTRAINT "storage_objects_owner_fk"
          FOREIGN KEY ("owner_id")
          REFERENCES "${schemaName}"."users" ("id")
          ON DELETE SET NULL
      );
    `);

    await this.prismaService.$executeRawUnsafe(`
      COMMENT ON TABLE "${schemaName}"."storage_objects"
        IS 'File storage metadata. Actual bytes live in the object store.';
    `);

    await this.prismaService.$executeRawUnsafe(`
      CREATE INDEX "storage_objects_bucket_idx"
        ON "${schemaName}"."storage_objects" ("bucket");
    `);

    await this.prismaService.$executeRawUnsafe(`
      CREATE INDEX "storage_objects_owner_idx"
        ON "${schemaName}"."storage_objects" ("owner_id");
    `);

    await this.prismaService.$executeRawUnsafe(`
      CREATE TRIGGER "storage_objects_set_updated_at"
        BEFORE UPDATE ON "${schemaName}"."storage_objects"
        FOR EACH ROW EXECUTE FUNCTION "${schemaName}"."set_updated_at"();
    `);

    // ── Grant table-level privileges to the tenant role ────────────────────
    for (const table of ['users', 'profiles', 'storage_objects']) {
      await this.prismaService.$executeRawUnsafe(`
        GRANT SELECT, INSERT, UPDATE, DELETE
          ON "${schemaName}"."${table}"
          TO "${dbRole}";
      `);
    }

    this.logger.debug(
      `Default tables (users, profiles, storage_objects) created in "${schemaName}"`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`DB job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `DB job ${job.id} (${job.name}) failed on attempt ${job.attemptsMade}/${job.opts.attempts ?? 3}: ${err.message}`,
      err.stack,
    );
  }
}
