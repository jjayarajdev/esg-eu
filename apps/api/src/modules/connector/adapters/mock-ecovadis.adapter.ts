import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Mock EcoVadis Adapter — simulates Procurement/Supply Chain data.
 * Procurement owns 13% of KPIs: E1, E5, S2.
 */
export class MockEcoVadisAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_ecovadis';
  readonly displayName = 'EcoVadis (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    return [
      // S2 — Workers in the Value Chain
      { metricCode: 'S2_4_SUPPLIERS_ASSESSED', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 1250 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ecovadis' },
      { metricCode: 'S2_4_SUPPLIERS_ASSESSED_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 78 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'ecovadis' },
      { metricCode: 'S2_4_FORCED_LABOUR_INCIDENTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 0 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ecovadis' },
      { metricCode: 'S2_4_CHILD_LABOUR_INCIDENTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 0 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ecovadis' },

      // E5 — Circular Economy (procurement-related)
      { metricCode: 'E5_4_MATERIALS_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 125000 }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'ecovadis' },
      { metricCode: 'E5_4_MATERIALS_RECYCLED_INPUT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 31250 }, unit: 'tonnes', confidenceLevel: 'calculated', sourceReference: 'ecovadis' },
      { metricCode: 'E5_4_RECYCLED_CONTENT_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 25 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'ecovadis' },
    ];
  }
}
