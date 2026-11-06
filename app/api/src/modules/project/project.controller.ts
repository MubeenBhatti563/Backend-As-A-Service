import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('create-project')
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Body() dto: CreateProjectDto,
    @GetUser('userId') userId: string,
  ) {
    return this.projectService.createProject(dto, userId);
  }

  @Get('get-all-project')
  @HttpCode(HttpStatus.OK)
  async getAllProjects(@GetUser('userId') userId: string) {
    return this.projectService.getAllProjects(userId);
  }
}
