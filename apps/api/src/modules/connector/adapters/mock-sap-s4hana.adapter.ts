import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Mock SAP S/4HANA Adapter — ERP/Financial data.
 * Covers ESRS 2 (general disclosures) and EU Taxonomy alignment KPIs.
 * Used by almost all large EU enterprises.
 */
export class MockSapS4HanaAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_sap_s4hana';
  readonly displayName = 'SAP S/4HANA (Mock)';

  validatePayload(raw: unknown): AdapterValidationResult {
    return { valid: true, errors: [] };
  }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    return [
      // ESRS 2 — General Disclosures (financial)
      { metricCode: 'ESRS2_SBM1_EMPLOYEE_COUNT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 34500 }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: 'sap_s4hana' },
      { metricCode: 'ESRS2_SBM1_REVENUE_TOTAL', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 10800000000 }, unit: 'EUR', confidenceLevel: 'measured', sourceReference: 'sap_s4hana' },

      // EU Taxonomy alignment
      { metricCode: 'TAX_TURNOVER_ELIGIBLE_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 62 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'sap_s4hana' },
      { metricCode: 'TAX_TURNOVER_ALIGNED_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 38 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'sap_s4hana' },
      { metricCode: 'TAX_CAPEX_ELIGIBLE_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 71 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'sap_s4hana' },
      { metricCode: 'TAX_CAPEX_ALIGNED_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 45 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'sap_s4hana' },
      { metricCode: 'TAX_OPEX_ELIGIBLE_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 55 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'sap_s4hana' },
      { metricCode: 'TAX_OPEX_ALIGNED_PCT', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 28 }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'sap_s4hana' },

      // E1 — Energy (from utility cost centers)
      { metricCode: 'E1_5_ENERGY_INTENSITY', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 78.7 }, unit: 'MWh/EUR M', confidenceLevel: 'calculated', sourceReference: 'sap_s4hana' },
      { metricCode: 'E1_6_GHG_INTENSITY', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 22.5 }, unit: 'tCO2e/EUR M', confidenceLevel: 'calculated', sourceReference: 'sap_s4hana' },

      // E1-9 Financial risk exposure
      { metricCode: 'E1_9_PHYSICAL_RISK_ASSETS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 450000000 }, unit: 'EUR', confidenceLevel: 'estimated', sourceReference: 'sap_s4hana' },
      { metricCode: 'E1_9_TRANSITION_RISK_ASSETS', periodStart: '2024-01-01', periodEnd: '2024-12-31', value: { numeric: 280000000 }, unit: 'EUR', confidenceLevel: 'estimated', sourceReference: 'sap_s4hana' },
    ];
  }
}
