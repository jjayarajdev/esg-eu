import type {
  IConnectorAdapter,
  NormalizedMetricValue,
  AdapterValidationResult,
} from './connector-adapter.port';

/**
 * Mock Enablon Adapter — simulates HSE&S environmental data.
 * Enablon owns 44% of KPIs: ESRS 2, E1, E2, E3, E5.
 *
 * In production, this would connect to Enablon's API.
 * In dev, it generates realistic fixture data.
 */
export class MockEnablonAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_enablon';
  readonly displayName = 'Enablon (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    if (!raw || typeof raw !== 'object') {
      return { valid: false, errors: ['Payload must be a JSON object'] };
    }
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    // Return realistic HSE&S fixture data
    return [
      // E1 — Climate Change
      { metricCode: 'E1_6_GHG_SCOPE1', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 12500 }, unit: 'tCO2e', confidenceLevel: 'measured', sourceReference: 'enablon' },
      { metricCode: 'E1_6_GHG_SCOPE2_LOCATION', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 45000 }, unit: 'tCO2e', confidenceLevel: 'measured', sourceReference: 'enablon' },
      { metricCode: 'E1_6_GHG_SCOPE2_MARKET', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 38000 }, unit: 'tCO2e', confidenceLevel: 'calculated', sourceReference: 'enablon' },
      { metricCode: 'E1_6_GHG_SCOPE3_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 185000 }, unit: 'tCO2e', confidenceLevel: 'estimated', sourceReference: 'enablon' },
      { metricCode: 'E1_6_GHG_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 242500 }, unit: 'tCO2e', confidenceLevel: 'calculated', sourceReference: 'enablon' },
      { metricCode: 'E1_5_ENERGY_CONSUMPTION_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 850000 }, unit: 'MWh', confidenceLevel: 'measured', sourceReference: 'enablon' },
      { metricCode: 'E1_5_ENERGY_CONSUMPTION_RENEWABLE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 340000 }, unit: 'MWh', confidenceLevel: 'measured', sourceReference: 'enablon' },
      { metricCode: 'E1_5_ENERGY_RENEWABLE_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 40 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'enablon' },

      // E2 — Pollution
      { metricCode: 'E2_4_AIR_POLLUTANTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 320 }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'enablon' },
      { metricCode: 'E2_4_WATER_POLLUTANTS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 45 }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'enablon' },

      // E3 — Water
      { metricCode: 'E3_4_WATER_CONSUMPTION_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 12.5 }, unit: 'ML', confidenceLevel: 'measured', sourceReference: 'enablon' },
      { metricCode: 'E3_4_WATER_WITHDRAWAL_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 18.2 }, unit: 'ML', confidenceLevel: 'measured', sourceReference: 'enablon' },

      // E5 — Waste
      { metricCode: 'E5_5_WASTE_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 15800 }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'enablon' },
      { metricCode: 'E5_5_WASTE_HAZARDOUS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 2100 }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'enablon' },
      { metricCode: 'E5_5_WASTE_RECYCLING_RATE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 72 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'enablon' },
    ];
  }

  /** Generate fixture data for a specific period */
  static generateFixture(): object {
    return { source: 'enablon', timestamp: new Date().toISOString(), type: 'environmental_data' };
  }
}
