import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProject(dto: CreateProjectDto, userId: string) {
    return this.prismaService.project.create({
      data: {
        name: dto.name,
        schemaName: `proj_ds_${randomUUID().replaceAll('-', '')}`,
        deploymentRegion: dto.region,
        description: dto.description,
        ownerId: userId,
      },
    });
  }
}
