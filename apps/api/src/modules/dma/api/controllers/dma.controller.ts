import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import {
  DmaAssessmentService,
  CreateDmaDto,
  ScoreTopicDto,
} from '../../services/dma-assessment.service';

@ApiTags('dma')
@Controller('dma')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class DmaController {
  constructor(private readonly service: DmaAssessmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new DMA assessment for a reporting period' })
  async create(@Body() dto: CreateDmaDto) {
    const assessment = await this.service.create(dto);
    return { data: assessment };
  }

  @Get()
  @ApiOperation({ summary: 'List all DMA assessments' })
  async list() {
    const assessments = await this.service.list();
    return { data: assessments };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get DMA assessment with all topic scores' })
  async findById(@Param('id') id: string) {
    const assessment = await this.service.findById(id);
    return { data: assessment };
  }

  @Put(':id/topics/:standardCode')
  @ApiOperation({ summary: 'Score a topic (impact + financial materiality)' })
  async scoreTopic(
    @Param('id') id: string,
    @Param('standardCode') standardCode: string,
    @Body() dto: ScoreTopicDto,
  ) {
    const topic = await this.service.scoreTopic(id, standardCode, dto);
    return { data: topic };
  }

  @Post(':id/finalize')
  @ApiOperation({ summary: 'Finalize assessment — computes materiality for all topics' })
  async finalize(@Param('id') id: string) {
    const assessment = await this.service.finalize(id);
    return { data: assessment };
  }

  @Get(':id/matrix')
  @ApiOperation({ summary: 'Get materiality matrix data for visualization' })
  async getMatrix(@Param('id') id: string) {
    const matrix = await this.service.getMatrix(id);
    return { data: matrix };
  }

  @Get(':id/material-topics')
  @ApiOperation({ summary: 'Get only material topics (for downstream modules)' })
  async getMaterialTopics(@Param('id') id: string) {
    const topics = await this.service.getMaterialTopics(id);
    return { data: topics };
  }
}
