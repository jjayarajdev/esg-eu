import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Mock Power BI Adapter — Generic BI/Reporting data export.
 * Power BI is used across multiple departments as a reporting layer.
 * Provides aggregated data from various internal systems.
 * Common in Microsoft-stack enterprises.
 */
export class MockPowerBiAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_powerbi';
  readonly displayName = 'Power BI (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    return [
      // E1 — Energy mix (from utility dashboards)
      { metricCode: 'E1_6_GHG_SCOPE2_LOCATION', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 44200 }, unit: 'tCO2e', confidenceLevel: 'calculated', sourceReference: 'powerbi' },
      { metricCode: 'E1_6_GHG_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 241700 }, unit: 'tCO2e', confidenceLevel: 'calculated', sourceReference: 'powerbi' },

      // E2 — Pollution (from environmental dashboards)
      { metricCode: 'E2_4_SOIL_POLLUTANTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 12 }, unit: 'tonnes', confidenceLevel: 'estimated', sourceReference: 'powerbi' },

      // E3 — Water (from operational dashboards)
      { metricCode: 'E3_4_WATER_DISCHARGE_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 5.7 }, unit: 'ML', confidenceLevel: 'calculated', sourceReference: 'powerbi' },
      { metricCode: 'E3_4_WATER_STRESS_AREAS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 3.2 }, unit: 'ML', confidenceLevel: 'estimated', sourceReference: 'powerbi' },

      // S1 — Social protection
      { metricCode: 'S1_8_COLLECTIVE_BARGAINING_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 64 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'powerbi' },
    ];
  }
}
