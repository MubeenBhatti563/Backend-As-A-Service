import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import * as crypto from 'crypto';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

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
    const anon = this.generateApiKey('pk');
    const service = this.generateApiKey('sk');

    const project = await this.prismaService.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name: dto.name,
          schemaName: `proj_${this.generateCryptoToken(12)}`,
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
}
