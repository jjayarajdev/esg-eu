import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PG_POOL } from './database.constants';
import { DatabaseService } from './database.service';
import { TenantAwareService } from './tenant-aware.service';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const pool = new Pool({
          connectionString: config.get<string>(
            'DATABASE_URL',
            'postgresql://esg:esg_dev@localhost:5433/esg_platform',
          ),
          max: 20,
        });
        pool.on('error', (err) => {
          console.error('Unexpected PG pool error:', err.message);
        });
        return pool;
      },
    },
    DatabaseService,
    TenantAwareService,
  ],
  exports: [PG_POOL, DatabaseService, TenantAwareService],
})
export class DatabaseModule {}
