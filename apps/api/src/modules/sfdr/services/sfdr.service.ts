import { Injectable } from '@nestjs/common';
import { NotFoundError } from '@esg/shared-kernel';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import { AuditService } from '../../../infrastructure/audit/audit.service';

/**
 * 14 Mandatory Principal Adverse Impact (PAI) indicators under SFDR.
 * Financial market participants must report these for their portfolios.
 */
const PAI_INDICATORS = [
  // Climate & Environment (7)
  { id: 'PAI_1', name: 'GHG emissions (Scope 1+2+3)', category: 'climate', unit: 'tCO2e', description: 'Total greenhouse gas emissions of investee companies' },
  { id: 'PAI_2', name: 'Carbon footprint', category: 'climate', unit: 'tCO2e/EUR M invested', description: 'Carbon footprint of the portfolio per EUR million invested' },
  { id: 'PAI_3', name: 'GHG intensity of investee companies', category: 'climate', unit: 'tCO2e/EUR M revenue', description: 'Weighted average GHG intensity of investee companies' },
  { id: 'PAI_4', name: 'Exposure to fossil fuel sector', category: 'climate', unit: '%', description: 'Share of investments in fossil fuel-related companies' },
  { id: 'PAI_5', name: 'Non-renewable energy share', category: 'climate', unit: '%', description: 'Share of non-renewable energy consumption and production' },
  { id: 'PAI_6', name: 'Energy consumption intensity per high impact sector', category: 'climate', unit: 'GWh/EUR M revenue', description: 'Energy consumption intensity per sector' },
  { id: 'PAI_7', name: 'Activities negatively affecting biodiversity-sensitive areas', category: 'environment', unit: '%', description: 'Share of investments in companies with sites in/near biodiversity-sensitive areas' },

  // Social (7)
  { id: 'PAI_8', name: 'Emissions to water', category: 'environment', unit: 'tonnes', description: 'Tonnes of emissions to water from investee companies' },
  { id: 'PAI_9', name: 'Hazardous waste ratio', category: 'environment', unit: 'tonnes', description: 'Tonnes of hazardous and radioactive waste generated' },
  { id: 'PAI_10', name: 'Violations of UN Global Compact and OECD Guidelines', category: 'social', unit: '%', description: 'Share of investments in companies involved in violations' },
  { id: 'PAI_11', name: 'Lack of processes to monitor compliance with UNGC/OECD', category: 'social', unit: '%', description: 'Share without compliance monitoring processes' },
  { id: 'PAI_12', name: 'Unadjusted gender pay gap', category: 'social', unit: '%', description: 'Average unadjusted gender pay gap of investee companies' },
  { id: 'PAI_13', name: 'Board gender diversity', category: 'social', unit: '%', description: 'Average ratio of female to male board members' },
  { id: 'PAI_14', name: 'Exposure to controversial weapons', category: 'social', unit: '%', description: 'Share of investments in companies involved in controversial weapons' },
];

const FUND_CLASSIFICATIONS = [
  { article: 6, name: 'Article 6', description: 'No specific ESG characteristics promoted. Must disclose sustainability risk integration.', color: 'slate' },
  { article: 8, name: 'Article 8 ("Light Green")', description: 'Promotes environmental or social characteristics. Must disclose how characteristics are met.', color: 'emerald' },
  { article: 9, name: 'Article 9 ("Dark Green")', description: 'Has sustainable investment as its objective. Strictest disclosure requirements.', color: 'blue' },
];

export interface CreateFundDto {
  fundName: string;
  article: number;
  aum?: number;
  description?: string;
}

@Injectable()
export class SfdrService {
  constructor(
    private readonly db: TenantAwareService,
    private readonly audit: AuditService,
  ) {}

  getPaiIndicators() { return PAI_INDICATORS; }
  getFundClassifications() { return FUND_CLASSIFICATIONS; }

  async createFund(dto: CreateFundDto): Promise<any> {
    // Store in reports table with type 'sfdr_fund'
    const result = await this.db.query(
      `INSERT INTO reports (reporting_period_id, report_type, status, metadata)
       VALUES ((SELECT id FROM reporting_periods WHERE is_current = true LIMIT 1), 'sfdr_fund', 'draft', $1)
       RETURNING *`,
      [JSON.stringify({
        fundName: dto.fundName, article: dto.article,
        aum: dto.aum || 0, description: dto.description || '',
        paiValues: PAI_INDICATORS.map((p) => ({ ...p, value: null })),
      })],
    );
    await this.audit.log({ action: 'created', entityType: 'sfdr_fund', entityId: result.rows[0].id });
    return this.parseFund(result.rows[0]);
  }

  async listFunds(): Promise<any[]> {
    const result = await this.db.query(
      "SELECT * FROM reports WHERE report_type = 'sfdr_fund' ORDER BY created_at DESC",
    );
    return result.rows.map((r: any) => this.parseFund(r));
  }

  async getFund(id: string): Promise<any> {
    const result = await this.db.query(
      "SELECT * FROM reports WHERE id = $1 AND report_type = 'sfdr_fund'",
      [id],
    );
    if (result.rows.length === 0) throw new NotFoundError('Fund not found');
    return this.parseFund(result.rows[0]);
  }

  async updatePaiValue(fundId: string, paiId: string, value: number): Promise<any> {
    const fund = await this.getFund(fundId);
    const meta = fund.metadata;
    const pai = meta.paiValues.find((p: any) => p.id === paiId);
    if (pai) pai.value = value;
    await this.db.query(
      'UPDATE reports SET metadata = $1, updated_at = now() WHERE id = $2',
      [JSON.stringify(meta), fundId],
    );
    return this.getFund(fundId);
  }

  private parseFund(row: any): any {
    return { ...row, metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata };
  }
}
