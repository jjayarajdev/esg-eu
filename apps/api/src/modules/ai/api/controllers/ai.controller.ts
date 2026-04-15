import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import { AiService, VarianceCommentaryDto, NarrativeDto } from '../../services/ai.service';

@ApiTags('ai')
@Controller('ai')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('variance-commentary')
  @ApiOperation({ summary: 'Generate AI variance commentary for a metric change' })
  async varianceCommentary(@Body() dto: VarianceCommentaryDto) {
    const result = await this.service.generateVarianceCommentary(dto);
    return { data: result };
  }

  @Post('narrative')
  @ApiOperation({ summary: 'Generate AI narrative for an ESRS disclosure section' })
  async narrative(@Body() dto: NarrativeDto) {
    const result = await this.service.synthesizeNarrative(dto);
    return { data: result };
  }
}
