import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { DEPARTMENT_TEMPLATES } from '@esg/esrs-taxonomy';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SchemaProvisioner {
  private schemaSql: string;

  constructor(private readonly db: DatabaseService) {
    // Try multiple paths: dist (compiled) and src (dev watch mode)
    const candidates = [
      path.join(__dirname, 'tenant-schema.sql'),
      path.resolve(process.cwd(), 'src/modules/tenant/infrastructure/persistence/tenant-schema.sql'),
    ];
    const found = candidates.find((p) => fs.existsSync(p));
    if (!found) {
      throw new Error(`tenant-schema.sql not found in: ${candidates.join(', ')}`);
    }
    this.schemaSql = fs.readFileSync(found, 'utf-8');
  }

  async provision(schemaName: string): Promise<void> {
    await this.db.withTransaction(async (client) => {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
      await client.query(`SET search_path TO ${schemaName}, shared, public`);
      await client.query(this.schemaSql);

      for (const dept of DEPARTMENT_TEMPLATES) {
        const result = await client.query(
          `INSERT INTO departments (name, code, description, sort_order)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [dept.name, dept.code, dept.description, dept.sortOrder],
        );
        const deptId = result.rows[0].id;

        for (const standardCode of dept.defaultStandards) {
          const stdResult = await client.query(
            `SELECT id FROM shared.esrs_standards WHERE code = $1`,
            [standardCode],
          );
          if (stdResult.rows.length > 0) {
            await client.query(
              `INSERT INTO department_standard_assignments (department_id, standard_id)
               VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [deptId, stdResult.rows[0].id],
            );
          }
        }
      }

      await client.query('SET search_path TO public');
    });
  }

  async drop(schemaName: string): Promise<void> {
    await this.db.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
  }
}
