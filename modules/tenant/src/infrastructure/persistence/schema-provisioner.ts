import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../apps/api/src/infrastructure/database/database.service';
import { DEPARTMENT_TEMPLATES } from '@esg/esrs-taxonomy';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Provisions a new PostgreSQL schema for a tenant.
 * Creates all tables, seeds default departments, and assigns ESRS standards.
 */
@Injectable()
export class SchemaProvisioner {
  private schemaSql: string;

  constructor(private readonly db: DatabaseService) {
    this.schemaSql = fs.readFileSync(
      path.join(__dirname, 'tenant-schema.sql'),
      'utf-8',
    );
  }

  /**
   * Create and provision a new tenant schema.
   * @param schemaName - e.g., 'tenant_acme'
   */
  async provision(schemaName: string): Promise<void> {
    await this.db.withTransaction(async (client) => {
      // Create the schema
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

      // Set search_path to the new schema
      await client.query(
        `SET search_path TO ${schemaName}, shared, public`,
      );

      // Run the migration SQL
      await client.query(this.schemaSql);

      // Seed default departments from ESRS taxonomy templates
      for (const dept of DEPARTMENT_TEMPLATES) {
        const result = await client.query(
          `INSERT INTO departments (name, code, description, sort_order)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [dept.name, dept.code, dept.description, dept.sortOrder],
        );

        const deptId = result.rows[0].id;

        // Assign default ESRS standards to this department
        for (const standardCode of dept.defaultStandards) {
          const stdResult = await client.query(
            `SELECT id FROM shared.esrs_standards WHERE code = $1`,
            [standardCode],
          );
          if (stdResult.rows.length > 0) {
            await client.query(
              `INSERT INTO department_standard_assignments (department_id, standard_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [deptId, stdResult.rows[0].id],
            );
          }
        }
      }

      // Reset search_path
      await client.query('SET search_path TO public');
    });
  }

  /**
   * Drop a tenant schema and all its data (GDPR deletion).
   */
  async drop(schemaName: string): Promise<void> {
    await this.db.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
  }
}
