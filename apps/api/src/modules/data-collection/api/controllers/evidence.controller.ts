import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import { EvidenceService } from '../../services/evidence.service';

@ApiTags('data')
@Controller('data/evidence')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class EvidenceController {
  constructor(private readonly service: EvidenceService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get a presigned URL for uploading evidence' })
  async getUploadUrl(@Body() body: {
    entityType: string;
    entityId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }) {
    const result = await this.service.getUploadUrl(body);
    return { data: result };
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get a presigned URL for downloading evidence' })
  async getDownloadUrl(@Param('id') id: string) {
    const result = await this.service.getDownloadUrl(id);
    return { data: result };
  }

  @Get()
  @ApiOperation({ summary: 'List evidence for an entity' })
  async listByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    const docs = await this.service.listByEntity(entityType, entityId);
    return { data: docs };
  }
}
