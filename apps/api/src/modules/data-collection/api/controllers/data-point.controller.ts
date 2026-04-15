import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import {
  MetricValueService,
  CreateDataPointDto,
  UpdateDataPointDto,
  ListDataPointsQuery,
} from '../../services/metric-value.service';

@ApiTags('data')
@Controller('data/points')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class DataPointController {
  constructor(private readonly service: MetricValueService) {}

  @Post()
  @ApiOperation({ summary: 'Create a data point (enter a metric value)' })
  async create(@Body() dto: CreateDataPointDto) {
    const dataPoint = await this.service.create(dto);
    return { data: dataPoint };
  }

  @Get()
  @ApiOperation({ summary: 'List data points (filterable by period, standard, status)' })
  async list(@Query() query: ListDataPointsQuery) {
    const result = await this.service.list(query);
    return {
      data: result.data,
      pagination: {
        page: query.page || 1,
        pageSize: query.pageSize || 25,
        totalCount: result.total,
        totalPages: Math.ceil(result.total / (query.pageSize || 25)),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single data point' })
  async findById(@Param('id') id: string) {
    const dataPoint = await this.service.findById(id);
    return { data: dataPoint };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a data point (value, status, variance explanation)' })
  async update(@Param('id') id: string, @Body() dto: UpdateDataPointDto) {
    const dataPoint = await this.service.update(id, dto);
    return { data: dataPoint };
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get audit trail for a data point' })
  async getHistory(@Param('id') id: string) {
    const history = await this.service.getHistory(id);
    return { data: history };
  }
}
