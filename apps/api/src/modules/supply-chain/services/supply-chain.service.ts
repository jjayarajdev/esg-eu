import { Injectable } from '@nestjs/common';
import { NotFoundError, ValidationError } from '@esg/shared-kernel';
import { getMetricByCode } from '@esg/esrs-taxonomy';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import { AuditService } from '../../../infrastructure/audit/audit.service';
import { randomBytes } from 'crypto';

export interface CreateCampaignDto {
  name: string;
  description?: string;
  deadline?: string;
  metricsRequested: string[];
}

export interface InviteSupplierDto {
  supplierName: string;
  supplierEmail: string;
}

export interface SubmitDataDto {
  responses: Array<{ metricCode: string; numericValue?: number; textValue?: string; notes?: string }>;
}

@Injectable()
export class SupplyChainService {
  constructor(
    private readonly db: TenantAwareService,
    private readonly audit: AuditService,
  ) {}

  async createCampaign(dto: CreateCampaignDto): Promise<any> {
    // Validate metric codes
    for (const code of dto.metricsRequested) {
      if (!getMetricByCode(code)) throw new ValidationError(`Unknown metric: ${code}`);
    }

    const result = await this.db.query(
      `INSERT INTO supply_chain_campaigns (name, description, deadline, metrics_requested)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [dto.name, dto.description || null, dto.deadline || null, dto.metricsRequested],
    );

    await this.audit.log({ action: 'created', entityType: 'supply_chain_campaign', entityId: result.rows[0].id });
    return result.rows[0];
  }

  async listCampaigns(): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM supply_chain_campaigns ORDER BY created_at DESC');

    // Add invite counts
    for (const campaign of result.rows) {
      const counts = await this.db.query(
        `SELECT
          count(*) as total,
          count(*) FILTER (WHERE status = 'submitted') as submitted,
          count(*) FILTER (WHERE status = 'pending') as pending
         FROM supply_chain_invites WHERE campaign_id = $1`,
        [campaign.id],
      );
      campaign.inviteCounts = counts.rows[0];
    }
    return result.rows;
  }

  async getCampaign(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM supply_chain_campaigns WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Campaign not found');

    const invites = await this.db.query(
      'SELECT * FROM supply_chain_invites WHERE campaign_id = $1 ORDER BY created_at DESC',
      [id],
    );

    // Get response data per invite
    for (const invite of invites.rows) {
      if (invite.status === 'submitted') {
        const responses = await this.db.query(
          'SELECT * FROM supply_chain_responses WHERE invite_id = $1',
          [invite.id],
        );
        invite.responses = responses.rows;
      }
    }

    // Enrich metrics with names
    const campaign = result.rows[0];
    campaign.metricsDetail = (campaign.metrics_requested || []).map((code: string) => {
      const def = getMetricByCode(code);
      return { code, name: def?.name || code, unit: def?.unit || '', standardCode: def?.standardCode || '' };
    });
    campaign.invites = invites.rows;

    return campaign;
  }

  async inviteSupplier(campaignId: string, dto: InviteSupplierDto): Promise<any> {
    const token = randomBytes(32).toString('hex');

    const result = await this.db.query(
      `INSERT INTO supply_chain_invites (campaign_id, supplier_name, supplier_email, access_token)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [campaignId, dto.supplierName, dto.supplierEmail, token],
    );

    const invite = result.rows[0];

    // Generate portal URL
    const ctx = this.db.tenantContext;
    invite.portalUrl = `/portal/${token}`;

    await this.audit.log({
      action: 'user_invited', entityType: 'supply_chain_invite', entityId: invite.id,
      changes: { supplierName: dto.supplierName, supplierEmail: dto.supplierEmail },
    });

    return invite;
  }

  /**
   * Get the supplier form data (PUBLIC — called with token, no tenant auth)
   * This method needs the tenant-aware DB, so the controller must set up context from the token.
   */
  async getPortalData(token: string): Promise<any> {
    // Find invite across all tenant schemas — we need to search platform-level
    // For now, use the current tenant context (mock mode)
    const invite = await this.db.query(
      'SELECT i.*, c.name as campaign_name, c.description, c.deadline, c.metrics_requested FROM supply_chain_invites i JOIN supply_chain_campaigns c ON c.id = i.campaign_id WHERE i.access_token = $1',
      [token],
    );

    if (invite.rows.length === 0) throw new NotFoundError('Invalid or expired portal link');

    const data = invite.rows[0];
    data.metricsDetail = (data.metrics_requested || []).map((code: string) => {
      const def = getMetricByCode(code);
      return { code, name: def?.name || code, description: def?.description || '', unit: def?.unit || '', standardCode: def?.standardCode || '' };
    });

    return data;
  }

  async submitPortalData(token: string, dto: SubmitDataDto): Promise<any> {
    const invite = await this.db.query(
      'SELECT * FROM supply_chain_invites WHERE access_token = $1',
      [token],
    );
    if (invite.rows.length === 0) throw new NotFoundError('Invalid portal link');
    if (invite.rows[0].status === 'submitted') throw new ValidationError('Data already submitted');

    // Store responses
    for (const resp of dto.responses) {
      await this.db.query(
        `INSERT INTO supply_chain_responses (invite_id, metric_code, numeric_value, text_value, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [invite.rows[0].id, resp.metricCode, resp.numericValue ?? null, resp.textValue ?? null, resp.notes ?? null],
      );
    }

    // Mark as submitted
    await this.db.query(
      `UPDATE supply_chain_invites SET status = 'submitted', submitted_at = now() WHERE id = $1`,
      [invite.rows[0].id],
    );

    return { submitted: dto.responses.length };
  }
}
