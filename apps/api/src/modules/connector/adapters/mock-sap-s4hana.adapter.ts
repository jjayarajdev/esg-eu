import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * SAP S/4HANA API Response Format.
 * Real S/4HANA uses OData v4 via SAP Business Technology Platform.
 * Financial data from: /API_FINANCIAL_STATEMENT, /API_COST_CENTER,
 * /API_FIXED_ASSET. EU Taxonomy from SAP Sustainability Control Tower.
 */
interface S4HanaPayload {
  d: {
    __metadata: { uri: string; type: string };
    companyCode: string;
    fiscalYear: string;
    currency: string;
    financials: {
      netRevenue: number;
      totalAssets: number;
      capitalExpenditures: number;
      operatingExpenditures: number;
    };
    workforce: {
      headcountFTE: number;
      personnelCosts: number;
    };
    taxonomyAlignment: {
      turnover: { eligible_pct: number; aligned_pct: number; byObjective: Array<{ objective: string; aligned_pct: number }> };
      capex: { eligible_pct: number; aligned_pct: number };
      opex: { eligible_pct: number; aligned_pct: number };
    };
    energyCosts: {
      totalUtilityCost: number;
      energyIntensity_MWhPerMRevenue: number;
    };
    climateRisk: {
      physicalRiskExposure: number;
      transitionRiskExposure: number;
      ghgIntensity_tCO2ePerMRevenue: number;
    };
  };
}

export class MockSapS4HanaAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_sap_s4hana';
  readonly displayName = 'SAP S/4HANA (Mock)';

  static generatePayload(): S4HanaPayload {
    return {
      d: {
        __metadata: {
          uri: "https://my-s4hana.s4hana.cloud.sap/sap/opu/odata4/sap/sustainability/v1/FinancialStatement('2024')",
          type: 'SAP__Sustainability.FinancialStatement',
        },
        companyCode: '1000',
        fiscalYear: '2024',
        currency: 'EUR',
        financials: {
          netRevenue: 10800000000,
          totalAssets: 15200000000,
          capitalExpenditures: 890000000,
          operatingExpenditures: 2100000000,
        },
        workforce: { headcountFTE: 34500, personnelCosts: 3200000000 },
        taxonomyAlignment: {
          turnover: {
            eligible_pct: 62, aligned_pct: 38,
            byObjective: [
              { objective: 'Climate change mitigation', aligned_pct: 32 },
              { objective: 'Circular economy', aligned_pct: 6 },
            ],
          },
          capex: { eligible_pct: 71, aligned_pct: 45 },
          opex: { eligible_pct: 55, aligned_pct: 28 },
        },
        energyCosts: { totalUtilityCost: 125000000, energyIntensity_MWhPerMRevenue: 78.7 },
        climateRisk: {
          physicalRiskExposure: 450000000,
          transitionRiskExposure: 280000000,
          ghgIntensity_tCO2ePerMRevenue: 22.5,
        },
      },
    };
  }

  validatePayload(raw: unknown): AdapterValidationResult { return { valid: true, errors: [] }; }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    const p = MockSapS4HanaAdapter.generatePayload().d;
    const period = { periodStart: '2024-01-01', periodEnd: '2024-12-31' };
    return [
      { ...period, metricCode: 'ESRS2_SBM1_EMPLOYEE_COUNT', value: { numeric: p.workforce.headcountFTE }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: `s4hana:CC${p.companyCode}` },
      { ...period, metricCode: 'ESRS2_SBM1_REVENUE_TOTAL', value: { numeric: p.financials.netRevenue }, unit: 'EUR', confidenceLevel: 'measured', sourceReference: `s4hana:FI-GL` },
      { ...period, metricCode: 'TAX_TURNOVER_ELIGIBLE_PCT', value: { numeric: p.taxonomyAlignment.turnover.eligible_pct }, unit: '%', confidenceLevel: 'calculated', sourceReference: 's4hana:taxonomy_module' },
      { ...period, metricCode: 'TAX_TURNOVER_ALIGNED_PCT', value: { numeric: p.taxonomyAlignment.turnover.aligned_pct }, unit: '%', confidenceLevel: 'calculated', sourceReference: 's4hana:taxonomy_module' },
      { ...period, metricCode: 'TAX_CAPEX_ELIGIBLE_PCT', value: { numeric: p.taxonomyAlignment.capex.eligible_pct }, unit: '%', confidenceLevel: 'calculated', sourceReference: 's4hana:taxonomy_module' },
      { ...period, metricCode: 'TAX_CAPEX_ALIGNED_PCT', value: { numeric: p.taxonomyAlignment.capex.aligned_pct }, unit: '%', confidenceLevel: 'calculated', sourceReference: 's4hana:taxonomy_module' },
      { ...period, metricCode: 'TAX_OPEX_ELIGIBLE_PCT', value: { numeric: p.taxonomyAlignment.opex.eligible_pct }, unit: '%', confidenceLevel: 'calculated', sourceReference: 's4hana:taxonomy_module' },
      { ...period, metricCode: 'TAX_OPEX_ALIGNED_PCT', value: { numeric: p.taxonomyAlignment.opex.aligned_pct }, unit: '%', confidenceLevel: 'calculated', sourceReference: 's4hana:taxonomy_module' },
      { ...period, metricCode: 'E1_5_ENERGY_INTENSITY', value: { numeric: p.energyCosts.energyIntensity_MWhPerMRevenue }, unit: 'MWh/EUR M', confidenceLevel: 'calculated', sourceReference: 's4hana:CO-CCA' },
      { ...period, metricCode: 'E1_6_GHG_INTENSITY', value: { numeric: p.climateRisk.ghgIntensity_tCO2ePerMRevenue }, unit: 'tCO2e/EUR M', confidenceLevel: 'calculated', sourceReference: 's4hana:sustainability_ctrl_tower' },
      { ...period, metricCode: 'E1_9_PHYSICAL_RISK_ASSETS', value: { numeric: p.climateRisk.physicalRiskExposure }, unit: 'EUR', confidenceLevel: 'estimated', sourceReference: 's4hana:risk_module' },
      { ...period, metricCode: 'E1_9_TRANSITION_RISK_ASSETS', value: { numeric: p.climateRisk.transitionRiskExposure }, unit: 'EUR', confidenceLevel: 'estimated', sourceReference: 's4hana:risk_module' },
    ];
  }
}
