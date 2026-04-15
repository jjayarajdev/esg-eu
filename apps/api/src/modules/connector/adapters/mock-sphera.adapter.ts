import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Mock Sphera Adapter — simulates Product Safety & Environmental data.
 * PSRA owns 2% of KPIs: E5. Also covers E2 substances of concern.
 */
export class MockSpheraAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_sphera';
  readonly displayName = 'Sphera (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    return [
      // E2 — Pollution (substances)
      { metricCode: 'E2_5_SUBSTANCES_OF_CONCERN', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 4200 }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'sphera' },
      { metricCode: 'E2_5_SVHC_SUBSTANCES', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 180 }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'sphera' },

      // E4 — Biodiversity
      { metricCode: 'E4_5_LAND_USE_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 850 }, unit: 'hectares', confidenceLevel: 'measured', sourceReference: 'sphera' },
      { metricCode: 'E4_5_LAND_USE_PROTECTED', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 12 }, unit: 'hectares', confidenceLevel: 'measured', sourceReference: 'sphera' },
      { metricCode: 'E4_5_SPECIES_AT_RISK', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 3 }, unit: 'count', confidenceLevel: 'estimated', sourceReference: 'sphera' },

      // E5 — Resource Use (product lifecycle)
      { metricCode: 'E5_4_MATERIALS_RENEWABLE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 18500 }, unit: 'tonnes', confidenceLevel: 'calculated', sourceReference: 'sphera' },
      { metricCode: 'E5_5_WASTE_RECYCLED', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 11376 }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'sphera' },
      { metricCode: 'E5_5_WASTE_LANDFILL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 4424 }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'sphera' },

      // S4 — Product safety
      { metricCode: 'S4_4_PRODUCT_SAFETY_INCIDENTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 2 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'sphera' },
      { metricCode: 'S4_4_DATA_PRIVACY_BREACHES', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 0 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'sphera' },
      { metricCode: 'S4_4_CUSTOMER_COMPLAINTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 156 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'sphera' },
    ];
  }
}
