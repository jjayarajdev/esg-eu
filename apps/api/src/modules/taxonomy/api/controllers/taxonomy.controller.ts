import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import { TaxonomyService, CreateTaxonomyDto, AddActivityDto, ScreenActivityDto } from '../../services/taxonomy.service';

@ApiTags('taxonomy')
@Controller('taxonomy')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TaxonomyController {
  constructor(private readonly service: TaxonomyService) {}

  @Post()
  @ApiOperation({ summary: 'Create EU Taxonomy assessment' })
  async create(@Body() dto: CreateTaxonomyDto) { return { data: await this.service.create(dto) }; }

  @Get()
  @ApiOperation({ summary: 'List taxonomy assessments' })
  async list() { return { data: await this.service.list() }; }

  @Get('activities')
  @ApiOperation({ summary: 'Get sample NACE activities' })
  getSampleActivities() { return { data: this.service.getSampleActivities() }; }

  @Get('objectives')
  @ApiOperation({ summary: 'Get environmental objectives' })
  getObjectives() { return { data: this.service.getEnvironmentalObjectives() }; }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment with activities' })
  async findById(@Param('id') id: string) { return { data: await this.service.findById(id) }; }

  @Post(':id/activities')
  @ApiOperation({ summary: 'Add economic activity to assessment' })
  async addActivity(@Param('id') id: string, @Body() dto: AddActivityDto) {
    return { data: await this.service.addActivity(id, dto) };
  }

  @Put(':id/activities/:activityId/screen')
  @ApiOperation({ summary: 'Screen activity through 4-step decision tree' })
  async screenActivity(@Param('id') id: string, @Param('activityId') activityId: string, @Body() dto: ScreenActivityDto) {
    return { data: await this.service.screenActivity(id, activityId, dto) };
  }

  @Post(':id/calculate')
  @ApiOperation({ summary: 'Calculate turnover/CapEx/OpEx alignment KPIs' })
  async calculate(@Param('id') id: string) { return { data: await this.service.calculateKPIs(id) }; }
}
