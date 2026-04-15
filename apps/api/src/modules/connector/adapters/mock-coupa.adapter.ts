import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Mock Coupa Adapter — Procurement platform data.
 * Covers S2 supply chain workers and G1 payment practices.
 * Common in large procurement organizations.
 */
export class MockCoupaAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_coupa';
  readonly displayName = 'Coupa (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    return [
      // S2 — Supply chain (procurement data)
      { metricCode: 'S2_4_SUPPLIERS_ASSESSED', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 890 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'coupa' },

      // S3 — Communities (local procurement)
      { metricCode: 'S3_4_COMMUNITY_GRIEVANCES', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 7 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'coupa' },

      // S1 — Discrimination (from supplier compliance)
      { metricCode: 'S1_17_DISCRIMINATION_INCIDENTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 3 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'coupa' },
      { metricCode: 'S1_17_HUMAN_RIGHTS_COMPLAINTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 8 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'coupa' },

      // E4 — Land use (from supply chain mapping)
      { metricCode: 'E4_5_LAND_USE_CHANGE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 2.5 }, unit: 'hectares', confidenceLevel: 'estimated', sourceReference: 'coupa' },
    ];
  }
}
