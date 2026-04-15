import { Module } from '@nestjs/common';
import { TaxonomyService } from './services/taxonomy.service';
import { TaxonomyController } from './api/controllers/taxonomy.controller';

@Module({
  providers: [TaxonomyService],
  controllers: [TaxonomyController],
  exports: [TaxonomyService],
})
export class TaxonomyModule {}
