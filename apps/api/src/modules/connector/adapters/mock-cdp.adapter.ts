import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Mock CDP (Carbon Disclosure Project) Adapter.
 * CDP is the primary investor-driven climate disclosure platform.
 * Provides E1 climate data that companies already report to CDP.
 */
export class MockCdpAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_cdp';
  readonly displayName = 'CDP (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    return [
      // E1 — Climate (CDP-reported data)
      { metricCode: 'E1_1_TRANSITION_PLAN_ALIGNED', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { boolean: true }, confidenceLevel: 'measured', sourceReference: 'cdp' },
      { metricCode: 'E1_4_GHG_REDUCTION_TARGET_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 42 }, unit: '%', confidenceLevel: 'measured', sourceReference: 'cdp' },
      { metricCode: 'E1_4_GHG_TARGET_YEAR', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 2030 }, unit: 'year', confidenceLevel: 'measured', sourceReference: 'cdp' },

      // E1 — Governance
      { metricCode: 'ESRS2_GOV1_BOARD_SUSTAINABILITY_OVERSIGHT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { boolean: true }, confidenceLevel: 'measured', sourceReference: 'cdp' },
      { metricCode: 'ESRS2_GOV1_SUSTAINABILITY_COMMITTEE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { boolean: true }, confidenceLevel: 'measured', sourceReference: 'cdp' },
      { metricCode: 'ESRS2_GOV3_SUSTAINABILITY_REMUNERATION', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { boolean: true }, confidenceLevel: 'measured', sourceReference: 'cdp' },
      { metricCode: 'ESRS2_GOV3_SUSTAINABILITY_REMUNERATION_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 15 }, unit: '%', confidenceLevel: 'measured', sourceReference: 'cdp' },
    ];
  }
}
