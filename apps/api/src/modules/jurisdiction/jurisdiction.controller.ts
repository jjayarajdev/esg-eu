import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JURISDICTIONS, FRAMEWORKS, getJurisdiction } from './jurisdiction.data';

@ApiTags('jurisdiction')
@Controller('jurisdictions')
export class JurisdictionController {
  @Get()
  @ApiOperation({ summary: 'List supported jurisdictions' })
  list() { return { data: JURISDICTIONS }; }

  @Get('frameworks')
  @ApiOperation({ summary: 'List all supported reporting frameworks' })
  listFrameworks() { return { data: FRAMEWORKS }; }

  @Get(':code')
  @ApiOperation({ summary: 'Get jurisdiction details with waves' })
  getByCode(@Param('code') code: string) {
    const j = getJurisdiction(code);
    return { data: j || null };
  }
}
