import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { DB_JOBS, DB_QUEUE } from '../../workers/db-workers/db.constants';
import { CreateNewTenant } from '../../workers/db-workers/db.interfaces';
import * as crypto from 'crypto';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(DB_QUEUE) private readonly dbQueue: Queue,
  ) {}

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private generateCryptoToken(byteLength: number = 32): string {
    return crypto.randomBytes(byteLength).toString('hex');
  }

  private generateApiKey(type: 'pk' | 'sk') {
    const raw = `${type}_live_${this.generateCryptoToken(32)}`;
    return {
      raw, // shown to the user once
      keyPrefix: raw.slice(0, 12), // e.g. "pk_live_a1b2" (safe to display)
      keyHash: this.hashToken(raw), // SHA-256, stored
    };
  }

  async createProject(dto: CreateProjectDto, userId: string) {
    // 1. Resolve active plan (falls back to HOBBY for unsubscribed users)
    const subscription = await this.prismaService.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
    const hobbyPlan = await this.prismaService.plan.findUniqueOrThrow({
      where: { code: 'HOBBY' },
    });
    const activePlan = subscription?.plan ?? hobbyPlan;

    // 2. Enforce maxProjects limit (null = unlimited for ENTERPRISE)
    if (activePlan.maxProjects !== null) {
      const projectCount = await this.prismaService.project.count({
        where: { ownerId: userId },
      });
      if (projectCount >= activePlan.maxProjects) {
        throw new ForbiddenException(
          `Your ${activePlan.name} plan allows up to ${activePlan.maxProjects} project(s). Upgrade your plan to create more.`,
        );
      }
    }

    const anon = this.generateApiKey('pk');
    const service = this.generateApiKey('sk');

    // Generate tenant credentials upfront so we can pass them to the BullMQ job
    const schemaName = `proj_${this.generateCryptoToken(12)}`;
    const dbRole = `role_proj_${this.generateCryptoToken(6)}`;
    const dbPassword = this.generateCryptoToken(16);

    const project = await this.prismaService.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name: dto.name,
          schemaName,
          deploymentRegion: dto.region,
          description: dto.description,
          ownerId: userId,
          status: 'PENDING',
        },
      });

      await tx.apiKey.createMany({
        data: [
          {
            projectId: newProject.id,
            createdBy: userId,
            name: 'Default publishable key',
            role: 'anon',
            keyPrefix: anon.keyPrefix,
            keyHash: anon.keyHash,
          },
          {
            projectId: newProject.id,
            createdBy: userId,
            name: 'Default secret key',
            role: 'service',
            keyPrefix: service.keyPrefix,
            keyHash: service.keyHash,
          },
        ],
      });

      await tx.activityLog.create({
        data: {
          userId,
          projectId: newProject.id,
          projectName: newProject.name,
          type: 'PROJECT_CREATED',
          description: 'Project created',
        },
      });

      return newProject;
    });

    // Dispatch the tenant provisioning job to the DB queue.
    // The worker will CREATE ROLE, CREATE SCHEMA, seed default tables,
    // and flip project status → ACTIVE.
    const payload: CreateNewTenant = {
      projectId: project.id,
      schemaName,
      dbRole,
      dbPassword,
    };
    await this.dbQueue.add(DB_JOBS.createDb, payload);

    this.logger.log(
      `Enqueued tenant provisioning job for project ${project.id} (schema: ${schemaName})`,
    );

    return {
      project,
      keys: {
        anon: anon.raw,
        service: service.raw,
      },
    };
  }

  async getAllProjects(userId: string) {
    return this.prismaService.project.findMany({ where: { ownerId: userId } });
  }

  async getRecentActivity(userId: string) {
    let logs = await this.prismaService.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Retroactive backfill: If user has existing projects but 0 activity logs, generate them
    if (logs.length === 0) {
      const existingProjects = await this.prismaService.project.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (existingProjects.length > 0) {
        await this.prismaService.activityLog.createMany({
          data: existingProjects.map((p) => ({
            userId,
            projectId: p.id,
            projectName: p.name,
            type: 'PROJECT_CREATED' as const,
            description: 'Project created',
            createdAt: p.createdAt,
          })),
        });

        logs = await this.prismaService.activityLog.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
      }
    }

    return logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      projectId: log.projectId,
      projectName: log.projectName,
      type: log.type,
      description: log.description,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
    }));
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async getProjectOverview(projectId: string, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: { id: projectId, ownerId: userId },
      include: {
        owner: { select: { email: true } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const allProjects = await this.prismaService.project.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const usage = await this.prismaService.projectUsage.findFirst({
      where: {
        projectId,
        periodStart: { gte: periodStart },
      },
    });

    const activityLogs = await this.prismaService.activityLog.findMany({
      where: {
        userId,
        projectId,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const regionLabels: Record<string, { label: string; code: string }> = {
      'us-east-1': { label: 'US-East-1 (N. Virginia)', code: 'US-EAST' },
      'us-west-2': { label: 'US-West-2 (Oregon)', code: 'US-WEST' },
      'eu-west-1': { label: 'EU-West-1 (Ireland)', code: 'EU-WEST' },
      'eu-central-1': { label: 'EU-Central-1 (Frankfurt)', code: 'EU-CENTRAL' },
      'ap-south-1': { label: 'AP-South-1 (Mumbai)', code: 'AP-SOUTH' },
      'ap-southeast-1': {
        label: 'AP-Southeast-1 (Singapore)',
        code: 'AP-SOUTHEAST',
      },
    };

    const regionInfo = regionLabels[project.deploymentRegion] ?? {
      label: project.deploymentRegion,
      code: project.deploymentRegion.toUpperCase().slice(0, 8),
    };

    const createdAtFormatted = project.createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const formatBytes = (bytes: bigint | number) => {
      const b = typeof bytes === 'bigint' ? Number(bytes) : bytes;
      if (b >= 1024 * 1024 * 1024) {
        return `${(b / (1024 * 1024 * 1024)).toFixed(1)} GB`;
      }
      return `${Math.max(1, Math.round(b / (1024 * 1024)))} MB`;
    };

    const dbSizeFormatted = usage ? formatBytes(usage.dbBytes) : '0 MB';
    const storageFormatted = usage ? formatBytes(usage.fileBytes) : '0 MB';
    const apiRequestsCount = usage ? Number(usage.apiRequests) : 0;

    const stats = [
      {
        key: 'api',
        label: 'API Requests (Today)',
        value: apiRequestsCount.toLocaleString(),
        change: '+0.0%',
        tone: 'success' as const,
      },
      {
        key: 'db',
        label: 'Database Size',
        value: dbSizeFormatted,
        change: '0% limit',
        tone: 'info' as const,
      },
      {
        key: 'storage',
        label: 'Storage Usage',
        value: storageFormatted,
        change: '0% limit',
        tone: 'success' as const,
        hideOnMobile: true,
      },
      {
        key: 'users',
        label: 'Active Users',
        value: '0',
        change: '+0.0%',
        tone: 'success' as const,
      },
    ];

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = (now.getDay() + 6) % 7; // Monday = 0
    const pointsApi = weekDays.map((label, idx) => ({
      label,
      value:
        idx <= currentDayIdx
          ? Math.round(apiRequestsCount / (currentDayIdx + 1))
          : 0,
    }));
    const pointsDb = weekDays.map((label, idx) => ({
      label,
      value:
        idx <= currentDayIdx
          ? Math.round(Number(usage?.dbBytes ?? 0n) / (1024 * 1024))
          : 0,
    }));

    const charts = [
      {
        title: 'API Requests Over Time',
        mobileTitle: 'API Requests over time',
        unit: 'requests',
        color: 'primary' as const,
        points: pointsApi,
      },
      {
        title: 'Database Usage (MB)',
        unit: 'MB',
        color: 'secondary' as const,
        hideOnMobile: true,
        points: pointsDb,
      },
    ];

    const timeAgo = (date: Date) => {
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60_000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return `${Math.floor(diffMins / 1440)}d ago`;
    };

    const activity = activityLogs.map((log) => ({
      id: log.id,
      icon: (log.type === 'PROJECT_CREATED'
        ? 'database'
        : log.type === 'API_KEY_CREATED'
          ? 'user'
          : 'function') as 'database' | 'user' | 'function',
      title: log.description,
      detail: log.projectName ?? project.schemaName,
      time: timeAgo(log.createdAt),
    }));

    if (activity.length === 0) {
      activity.push({
        id: `created-${project.id}`,
        icon: 'database',
        title: 'Project provisioned',
        detail: `schema: ${project.schemaName}`,
        time: timeAgo(project.createdAt),
      });
    }

    const isProvisioned = project.status === 'ACTIVE';

    const health = [
      { id: 'gw', name: 'API Gateway', status: 'operational' as const },
      {
        id: 'db',
        name: 'Database Service',
        status: isProvisioned
          ? ('operational' as const)
          : ('degraded' as const),
      },
      {
        id: 'rt',
        name: 'Realtime WebSockets',
        status: 'operational' as const,
      },
      { id: 'cdn', name: 'Storage CDN', status: 'operational' as const },
    ];

    return {
      project: {
        id: project.id,
        name: project.name,
        identifier: project.schemaName,
        region: regionInfo.label,
        regionCode: regionInfo.code,
        status: project.status.toLowerCase() as 'active' | 'paused' | 'pending',
        createdAt: createdAtFormatted,
      },
      projects: allProjects.map((p) => ({ id: p.id, name: p.name })),
      user: { email: project.owner.email },
      stats,
      charts,
      activity,
      health,
    };
  }
}
