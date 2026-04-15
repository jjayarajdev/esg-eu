import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import { WorkflowService, CreateWorkflowDto } from '../../services/workflow.service';

@ApiTags('workflows')
@Controller('workflows')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(private readonly service: WorkflowService) {}

  @Post()
  @ApiOperation({ summary: 'Create an approval workflow for an entity' })
  async create(@Body() dto: CreateWorkflowDto) {
    const workflow = await this.service.create(dto);
    return { data: workflow };
  }

  @Get()
  @ApiOperation({ summary: 'List workflows (filterable by status, entityType)' })
  async list(
    @Query('status') status?: string,
    @Query('entityType') entityType?: string,
  ) {
    const workflows = await this.service.list({ status, entityType });
    return { data: workflows };
  }

  @Get('pending')
  @ApiOperation({ summary: 'List pending approval tasks' })
  async listPending() {
    const workflows = await this.service.listPending();
    return { data: workflows };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow with all steps' })
  async findById(@Param('id') id: string) {
    const workflow = await this.service.findById(id);
    return { data: workflow };
  }

  @Post(':id/steps/:stepId/approve')
  @ApiOperation({ summary: 'Approve a workflow step' })
  async approve(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() body: { comments?: string },
  ) {
    const workflow = await this.service.approve(id, stepId, body.comments);
    return { data: workflow };
  }

  @Post(':id/steps/:stepId/reject')
  @ApiOperation({ summary: 'Reject a workflow step (requires comment)' })
  async reject(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() body: { comments: string },
  ) {
    const workflow = await this.service.reject(id, stepId, body.comments);
    return { data: workflow };
  }
}
