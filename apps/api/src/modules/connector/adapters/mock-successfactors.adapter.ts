import type {
  IConnectorAdapter,
  NormalizedMetricValue,
  AdapterValidationResult,
} from './connector-adapter.port';

/**
 * Mock SuccessFactors Adapter — simulates HR workforce data.
 * HR owns 22% of KPIs: ESRS 2, S1.
 */
export class MockSuccessFactorsAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_successfactors';
  readonly displayName = 'SAP SuccessFactors (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    if (!raw || typeof raw !== 'object') {
      return { valid: false, errors: ['Payload must be a JSON object'] };
    }
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    return [
      // S1-6 Employee demographics
      { metricCode: 'S1_6_EMPLOYEES_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 34500 }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: 'successfactors' },
      { metricCode: 'S1_6_EMPLOYEES_FEMALE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 12420 }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: 'successfactors' },
      { metricCode: 'S1_6_EMPLOYEES_MALE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 22080 }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: 'successfactors' },
      { metricCode: 'S1_6_EMPLOYEES_PERMANENT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 31050 }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: 'successfactors' },
      { metricCode: 'S1_6_EMPLOYEES_TEMPORARY', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 3450 }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: 'successfactors' },
      { metricCode: 'S1_6_VOLUNTARY_TURNOVER_RATE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 8.2 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'successfactors' },

      // S1-8 Collective bargaining
      { metricCode: 'S1_8_COLLECTIVE_BARGAINING_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 65 }, unit: '%', confidenceLevel: 'measured', sourceReference: 'successfactors' },

      // S1-9 Diversity
      { metricCode: 'S1_9_WOMEN_MANAGEMENT_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 32 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'successfactors' },
      { metricCode: 'S1_9_WOMEN_BOARD_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 40 }, unit: '%', confidenceLevel: 'measured', sourceReference: 'successfactors' },
      { metricCode: 'S1_9_AGE_UNDER30_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 18 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'successfactors' },
      { metricCode: 'S1_9_AGE_30TO50_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 55 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'successfactors' },
      { metricCode: 'S1_9_AGE_OVER50_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 27 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'successfactors' },

      // S1-13 Training
      { metricCode: 'S1_13_TRAINING_HOURS_PER_EMPLOYEE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 24.5 }, unit: 'hours/employee', confidenceLevel: 'calculated', sourceReference: 'successfactors' },

      // S1-14 Health & Safety
      { metricCode: 'S1_14_FATALITIES', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 0 }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'successfactors' },
      { metricCode: 'S1_14_TRIR', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 0.42 }, unit: 'rate', confidenceLevel: 'calculated', sourceReference: 'successfactors' },
      { metricCode: 'S1_14_LOST_TIME_INJURY_RATE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 0.18 }, unit: 'rate', confidenceLevel: 'calculated', sourceReference: 'successfactors' },

      // S1-16 Pay gap
      { metricCode: 'S1_16_GENDER_PAY_GAP', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 4.2 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'successfactors' },
    ];
  }
}
