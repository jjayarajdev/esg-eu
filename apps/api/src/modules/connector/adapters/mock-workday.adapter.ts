import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Mock Workday Adapter — HR/People data (alternative to SuccessFactors).
 * Common in US-origin multinationals. Covers S1 workforce metrics.
 */
export class MockWorkdayAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_workday';
  readonly displayName = 'Workday (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    return [
      { metricCode: 'S1_6_EMPLOYEES_FULLTIME', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 31050 }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: 'workday' },
      { metricCode: 'S1_6_EMPLOYEES_PARTTIME', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 3450 }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: 'workday' },
      { metricCode: 'S1_7_NONEMPLOYEE_WORKERS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 4200 }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: 'workday' },
      { metricCode: 'S1_10_ADEQUATE_WAGES', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { boolean: true }, confidenceLevel: 'measured', sourceReference: 'workday' },
      { metricCode: 'S1_12_DISABILITY_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 3.8 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'workday' },
      { metricCode: 'S1_15_FAMILY_LEAVE_ENTITLED_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 100 }, unit: '%', confidenceLevel: 'measured', sourceReference: 'workday' },
      { metricCode: 'S1_13_TRAINING_HOURS_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 845250 }, unit: 'hours', confidenceLevel: 'measured', sourceReference: 'workday' },
      { metricCode: 'S1_6_INVOLUNTARY_TURNOVER_RATE', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 2.1 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'workday' },
      { metricCode: 'S1_16_CEO_PAY_RATIO', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 42 }, unit: 'ratio', confidenceLevel: 'calculated', sourceReference: 'workday' },
    ];
  }
}
