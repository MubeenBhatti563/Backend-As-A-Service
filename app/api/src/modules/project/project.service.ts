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
import { generateCryptoToken, hashToken } from '@baas/crypto-utils';
import { presentProjectOverview } from './utils/project-overview.presenter';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(DB_QUEUE) private readonly dbQueue: Queue,
  ) {}

  private hashToken(rawToken: string): string {
    return hashToken(rawToken);
  }

  private generateCryptoToken(byteLength: number = 32): string {
    return generateCryptoToken(byteLength);
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
    const projects = await this.prismaService.project.findMany({
      where: { ownerId: userId },
      include: { projectUsages: { orderBy: { periodStart: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
    });
    return projects.map(({ projectUsages, ...project }) => ({
      ...project,
      dbBytes: projectUsages?.[0]?.dbBytes.toString() ?? '0',
      fileBytes: projectUsages?.[0]?.fileBytes.toString() ?? '0',
    }));
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

    const dailyUsage = await this.prismaService.projectUsageDaily.findMany({
      where: { projectId, day: { gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6)) } },
      orderBy: { day: 'asc' },
      select: { day: true, apiRequests: true, dbBytes: true },
    });

    return presentProjectOverview({
      project,
      projects: allProjects,
      userEmail: project.owner.email,
      usage,
      activityLogs,
      dailyUsage,
      now,
    });
  }
}
