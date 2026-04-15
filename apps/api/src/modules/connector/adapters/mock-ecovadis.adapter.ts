import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * EcoVadis Sustainability Ratings Platform API.
 * Real API: https://api.ecovadis.com/v1/scorecards, /v1/findings
 * Returns supplier sustainability scorecards with environmental,
 * labor, ethics, and procurement ratings.
 */
interface EcoVadisPayload {
  requestId: string;
  generatedAt: string;
  companyProfile: { companyId: string; companyName: string; industry: string; country: string };
  supplierPortfolio: {
    totalSuppliers: number;
    assessed: number;
    assessedPercentage: number;
    averageScore: number;
    ratingDistribution: { platinum: number; gold: number; silver: number; bronze: number; unrated: number };
    findings: {
      forcedLabour: { incidents: number; suppliersWithFindings: number };
      childLabour: { incidents: number; suppliersWithFindings: number };
      environmentalViolations: { incidents: number; suppliersWithFindings: number };
    };
  };
  materialFlows: {
    totalMaterialsProcured_tonnes: number;
    recycledInput_tonnes: number;
    recycledContentPercentage: number;
    sustainablySourced_tonnes: number;
    certifiedSuppliers: number;
  };
}

export class MockEcoVadisAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_ecovadis';
  readonly displayName = 'EcoVadis (Mock)';

  static generatePayload(): EcoVadisPayload {
    return {
      requestId: 'ev-req-2024-q4-export',
      generatedAt: '2025-01-20T14:00:00Z',
      companyProfile: { companyId: 'EV-ACME-001', companyName: 'Acme Corporation', industry: 'Chemicals', country: 'NL' },
      supplierPortfolio: {
        totalSuppliers: 1600,
        assessed: 1250,
        assessedPercentage: 78,
        averageScore: 58.4,
        ratingDistribution: { platinum: 45, gold: 280, silver: 520, bronze: 350, unrated: 405 },
        findings: {
          forcedLabour: { incidents: 0, suppliersWithFindings: 0 },
          childLabour: { incidents: 0, suppliersWithFindings: 0 },
          environmentalViolations: { incidents: 3, suppliersWithFindings: 2 },
        },
      },
      materialFlows: {
        totalMaterialsProcured_tonnes: 125000,
        recycledInput_tonnes: 31250,
        recycledContentPercentage: 25,
        sustainablySourced_tonnes: 48000,
        certifiedSuppliers: 312,
      },
    };
  }

  validatePayload(raw: unknown): AdapterValidationResult { return { valid: true, errors: [] }; }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    const p = MockEcoVadisAdapter.generatePayload();
    const sp = p.supplierPortfolio;
    const mf = p.materialFlows;
    const period = { periodStart: '2024-01-01', periodEnd: '2024-12-31' };
    return [
      { ...period, metricCode: 'S2_4_SUPPLIERS_ASSESSED', value: { numeric: sp.assessed }, unit: 'count', confidenceLevel: 'measured', sourceReference: `ecovadis:${p.companyProfile.companyId}` },
      { ...period, metricCode: 'S2_4_SUPPLIERS_ASSESSED_PCT', value: { numeric: sp.assessedPercentage }, unit: '%', confidenceLevel: 'calculated', sourceReference: `ecovadis:portfolio_score` },
      { ...period, metricCode: 'S2_4_FORCED_LABOUR_INCIDENTS', value: { numeric: sp.findings.forcedLabour.incidents }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ecovadis:findings' },
      { ...period, metricCode: 'S2_4_CHILD_LABOUR_INCIDENTS', value: { numeric: sp.findings.childLabour.incidents }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ecovadis:findings' },
      { ...period, metricCode: 'E5_4_MATERIALS_TOTAL', value: { numeric: mf.totalMaterialsProcured_tonnes }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'ecovadis:material_flows' },
      { ...period, metricCode: 'E5_4_MATERIALS_RECYCLED_INPUT', value: { numeric: mf.recycledInput_tonnes }, unit: 'tonnes', confidenceLevel: 'calculated', sourceReference: 'ecovadis:material_flows' },
      { ...period, metricCode: 'E5_4_RECYCLED_CONTENT_PCT', value: { numeric: mf.recycledContentPercentage }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'ecovadis:material_flows' },
    ];
  }
}
