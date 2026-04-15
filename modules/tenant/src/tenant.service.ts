import { Injectable } from '@nestjs/common';
import {
  NotFoundError,
  ConflictError,
  TenantContext,
} from '@esg/shared-kernel';
import { DatabaseService } from '../../../apps/api/src/infrastructure/database/database.service';
import { SchemaProvisioner } from './infrastructure/persistence/schema-provisioner';

export interface CreateTenantDto {
  name: string;
  slug: string;
  subscriptionTier?: string;
  companySize?: string;
  csrdWave?: number;
  countryCode?: string;
  industrySector?: string;
  employeeCount?: number;
}

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  schema_name: string;
  subscription_tier: string;
  company_size: string | null;
  csrd_wave: number | null;
  country_code: string | null;
  industry_sector: string | null;
  employee_count: number | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class TenantService {
  constructor(
    private readonly db: DatabaseService,
    private readonly provisioner: SchemaProvisioner,
  ) {}

  async create(dto: CreateTenantDto): Promise<TenantRow> {
    // Check slug uniqueness
    const existing = await this.db.query(
      'SELECT id FROM platform.tenants WHERE slug = $1',
      [dto.slug],
    );
    if (existing.rows.length > 0) {
      throw new ConflictError(`Tenant with slug "${dto.slug}" already exists.`);
    }

    // Insert tenant record
    const result = await this.db.query(
      `INSERT INTO platform.tenants (name, slug, subscription_tier, company_size, csrd_wave, country_code, industry_sector, employee_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        dto.name,
        dto.slug,
        dto.subscriptionTier || 'esrs_core',
        dto.companySize || null,
        dto.csrdWave || null,
        dto.countryCode || null,
        dto.industrySector || null,
        dto.employeeCount || null,
      ],
    );

    const tenant = result.rows[0] as TenantRow;

    // Provision the tenant schema
    const schemaName = TenantContext.schemaNameFromSlug(dto.slug);
    await this.provisioner.provision(schemaName);

    // Update schema version
    await this.db.query(
      'UPDATE platform.tenants SET schema_version = 1 WHERE id = $1',
      [tenant.id],
    );

    return tenant;
  }

  async findById(id: string): Promise<TenantRow> {
    const result = await this.db.query(
      'SELECT * FROM platform.tenants WHERE id = $1 AND is_active = true',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundError(`Tenant not found: ${id}`);
    }
    return result.rows[0] as TenantRow;
  }

  async update(
    id: string,
    updates: Partial<Pick<CreateTenantDto, 'name' | 'companySize' | 'csrdWave' | 'countryCode' | 'industrySector' | 'employeeCount'>>,
  ): Promise<TenantRow> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.companySize !== undefined) {
      setClauses.push(`company_size = $${paramIndex++}`);
      values.push(updates.companySize);
    }
    if (updates.csrdWave !== undefined) {
      setClauses.push(`csrd_wave = $${paramIndex++}`);
      values.push(updates.csrdWave);
    }
    if (updates.countryCode !== undefined) {
      setClauses.push(`country_code = $${paramIndex++}`);
      values.push(updates.countryCode);
    }
    if (updates.industrySector !== undefined) {
      setClauses.push(`industry_sector = $${paramIndex++}`);
      values.push(updates.industrySector);
    }
    if (updates.employeeCount !== undefined) {
      setClauses.push(`employee_count = $${paramIndex++}`);
      values.push(updates.employeeCount);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push(`updated_at = now()`);
    values.push(id);

    const result = await this.db.query(
      `UPDATE platform.tenants SET ${setClauses.join(', ')} WHERE id = $${paramIndex} AND is_active = true RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Tenant not found: ${id}`);
    }
    return result.rows[0] as TenantRow;
  }

  async delete(id: string): Promise<void> {
    const tenant = await this.findById(id);

    // Drop the tenant schema (GDPR: complete data removal)
    await this.provisioner.drop(tenant.schema_name);

    // Mark tenant as inactive (soft delete the registry record)
    await this.db.query(
      'UPDATE platform.tenants SET is_active = false, updated_at = now() WHERE id = $1',
      [id],
    );
  }

  async list(): Promise<TenantRow[]> {
    const result = await this.db.query(
      'SELECT * FROM platform.tenants WHERE is_active = true ORDER BY created_at DESC',
    );
    return result.rows as TenantRow[];
  }
}
