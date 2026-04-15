import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Coupa Business Spend Management API.
 * Real API: /api/suppliers, /api/purchase_orders, /api/invoices
 * Provides procurement data including supplier compliance,
 * payment practices, and supply chain transparency.
 */
interface CoupaPayload {
  exportMetadata: { instanceUrl: string; exportDate: string; currency: string };
  supplierCompliance: {
    totalActiveSuppliers: number;
    suppliersAssessedForSocialImpact: number;
    supplierDiversityProgram: boolean;
    highRiskSuppliers: number;
    auditsConducted: number;
  };
  communityImpact: {
    grievancesReceived: number;
    grievancesResolved: number;
    localSourcingPercentage: number;
  };
  humanRights: {
    discriminationIncidentsReported: number;
    humanRightsComplaintsReceived: number;
    modernSlaveryStatementPublished: boolean;
  };
  environmentalSupplyChain: {
    landUseChangeFromSourcing_ha: number;
    deforestationRiskSuppliers: number;
  };
}

export class MockCoupaAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_coupa';
  readonly displayName = 'Coupa (Mock)';

  static generatePayload(): CoupaPayload {
    return {
      exportMetadata: { instanceUrl: 'https://acme.coupahost.com', exportDate: '2025-01-25T12:00:00Z', currency: 'EUR' },
      supplierCompliance: {
        totalActiveSuppliers: 1600, suppliersAssessedForSocialImpact: 890,
        supplierDiversityProgram: true, highRiskSuppliers: 45, auditsConducted: 120,
      },
      communityImpact: { grievancesReceived: 7, grievancesResolved: 5, localSourcingPercentage: 42 },
      humanRights: {
        discriminationIncidentsReported: 3, humanRightsComplaintsReceived: 8,
        modernSlaveryStatementPublished: true,
      },
      environmentalSupplyChain: { landUseChangeFromSourcing_ha: 2.5, deforestationRiskSuppliers: 12 },
    };
  }

  validatePayload(raw: unknown): AdapterValidationResult { return { valid: true, errors: [] }; }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    const p = MockCoupaAdapter.generatePayload();
    const period = { periodStart: '2024-01-01', periodEnd: '2024-12-31' };
    return [
      { ...period, metricCode: 'S2_4_SUPPLIERS_ASSESSED', value: { numeric: p.supplierCompliance.suppliersAssessedForSocialImpact }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'coupa:supplier_mgmt' },
      { ...period, metricCode: 'S3_4_COMMUNITY_GRIEVANCES', value: { numeric: p.communityImpact.grievancesReceived }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'coupa:community_portal' },
      { ...period, metricCode: 'S1_17_DISCRIMINATION_INCIDENTS', value: { numeric: p.humanRights.discriminationIncidentsReported }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'coupa:hr_compliance' },
      { ...period, metricCode: 'S1_17_HUMAN_RIGHTS_COMPLAINTS', value: { numeric: p.humanRights.humanRightsComplaintsReceived }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'coupa:hr_compliance' },
      { ...period, metricCode: 'E4_5_LAND_USE_CHANGE', value: { numeric: p.environmentalSupplyChain.landUseChangeFromSourcing_ha }, unit: 'hectares', confidenceLevel: 'estimated', sourceReference: 'coupa:supply_chain_env' },
    ];
  }
}
