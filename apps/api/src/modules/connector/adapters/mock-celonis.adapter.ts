import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Mock Celonis Adapter — Process Mining data.
 * Provides supply chain efficiency metrics, resource flow analysis.
 * Common in manufacturing and logistics enterprises.
 */
export class MockCelonisAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_celonis';
  readonly displayName = 'Celonis (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    return [
      // E3 — Water (process optimization data)
      { metricCode: 'E3_4_WATER_RECYCLED', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 5.8 }, unit: 'ML', confidenceLevel: 'calculated', sourceReference: 'celonis' },
      { metricCode: 'E3_4_WATER_INTENSITY', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 1.16 }, unit: 'ML/EUR M', confidenceLevel: 'calculated', sourceReference: 'celonis' },

      // E5 — Resource efficiency (process mining insights)
      { metricCode: 'E5_5_WASTE_NONHAZARDOUS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 13700 }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'celonis' },
      { metricCode: 'E1_5_ENERGY_CONSUMPTION_NONRENEWABLE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 510000 }, unit: 'MWh', confidenceLevel: 'measured', sourceReference: 'celonis' },

      // S1 — Operational safety (from process analysis)
      { metricCode: 'S1_14_RECORDABLE_INCIDENTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 23 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'celonis' },
      { metricCode: 'S1_14_DAYS_LOST', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 412 }, unit: 'days', confidenceLevel: 'measured', sourceReference: 'celonis' },
      { metricCode: 'S1_14_OCCUPATIONAL_DISEASE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 5 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'celonis' },
    ];
  }
}
