import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Mock EthicsPoint Adapter — simulates Legal/Governance data.
 * Legal owns 4% of KPIs: G1.
 */
export class MockEthicsPointAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_ethicspoint';
  readonly displayName = 'EthicsPoint (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    return [
      // G1 — Business Conduct
      { metricCode: 'G1_1_WHISTLEBLOWER_REPORTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 42 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ethicspoint' },
      { metricCode: 'G1_1_WHISTLEBLOWER_RESOLVED', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 38 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ethicspoint' },
      { metricCode: 'G1_1_CODE_TRAINING_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 94 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'ethicspoint' },
      { metricCode: 'G1_3_ANTICORRUPTION_TRAINING_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 91 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'ethicspoint' },
      { metricCode: 'G1_4_CORRUPTION_INCIDENTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 1 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ethicspoint' },
      { metricCode: 'G1_4_CORRUPTION_LEGAL_ACTIONS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 0 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ethicspoint' },
      { metricCode: 'G1_5_POLITICAL_DONATIONS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 0 }, unit: 'EUR', confidenceLevel: 'measured', sourceReference: 'ethicspoint' },
      { metricCode: 'G1_5_LOBBYING_SPEND', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 185000 }, unit: 'EUR', confidenceLevel: 'measured', sourceReference: 'ethicspoint' },
      { metricCode: 'G1_6_PAYMENT_TERMS_DAYS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 45 }, unit: 'days', confidenceLevel: 'measured', sourceReference: 'ethicspoint' },
      { metricCode: 'G1_6_ONTIME_PAYMENT_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 87 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'ethicspoint' },
      { metricCode: 'G1_6_DPO', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 52 }, unit: 'days', confidenceLevel: 'calculated', sourceReference: 'ethicspoint' },
    ];
  }
}
