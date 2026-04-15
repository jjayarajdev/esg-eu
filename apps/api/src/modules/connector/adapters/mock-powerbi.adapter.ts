import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Microsoft Power BI REST API / Dataflow Export Format.
 * Real API: /v1.0/myorg/datasets/{id}/executeQueries
 * Power BI serves as a BI layer aggregating data from multiple
 * department-specific dashboards into ESG-ready exports.
 */
interface PowerBiPayload {
  results: Array<{
    tables: Array<{
      rows: Array<{
        measure: string;
        category: string;
        value: number;
        unit: string;
        department: string;
        lastRefreshed: string;
      }>;
    }>;
  }>;
  requestId: string;
  datasetId: string;
  reportName: string;
}

export class MockPowerBiAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_powerbi';
  readonly displayName = 'Power BI (Mock)';

  static generatePayload(): PowerBiPayload {
    return {
      requestId: 'pbi-esg-export-20250120',
      datasetId: 'ds-acme-esg-consolidated',
      reportName: 'ESG Consolidated KPIs Q4 2024',
      results: [{
        tables: [{
          rows: [
            { measure: 'GHG_Scope2_Location', category: 'Emissions', value: 44200, unit: 'tCO2e', department: 'Sustainability', lastRefreshed: '2025-01-15T06:00:00Z' },
            { measure: 'GHG_Total', category: 'Emissions', value: 241700, unit: 'tCO2e', department: 'Sustainability', lastRefreshed: '2025-01-15T06:00:00Z' },
            { measure: 'Soil_Pollutants', category: 'Pollution', value: 12, unit: 'tonnes', department: 'HSE&S', lastRefreshed: '2025-01-14T06:00:00Z' },
            { measure: 'Water_Discharge', category: 'Water', value: 5.7, unit: 'ML', department: 'HSE&S', lastRefreshed: '2025-01-14T06:00:00Z' },
            { measure: 'Water_Stress_Areas', category: 'Water', value: 3.2, unit: 'ML', department: 'HSE&S', lastRefreshed: '2025-01-14T06:00:00Z' },
            { measure: 'Collective_Bargaining', category: 'Workforce', value: 64, unit: 'Percent', department: 'HR', lastRefreshed: '2025-01-13T06:00:00Z' },
          ],
        }],
      }],
    };
  }

  validatePayload(raw: unknown): AdapterValidationResult { return { valid: true, errors: [] }; }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    const p = MockPowerBiAdapter.generatePayload();
    const rows = p.results[0].tables[0].rows;
    const period = { periodStart: '2024-01-01', periodEnd: '2024-12-31' };

    const mapping: Record<string, { esrs: string; unit: string }> = {
      'GHG_Scope2_Location': { esrs: 'E1_6_GHG_SCOPE2_LOCATION', unit: 'tCO2e' },
      'GHG_Total': { esrs: 'E1_6_GHG_TOTAL', unit: 'tCO2e' },
      'Soil_Pollutants': { esrs: 'E2_4_SOIL_POLLUTANTS', unit: 'tonnes' },
      'Water_Discharge': { esrs: 'E3_4_WATER_DISCHARGE_TOTAL', unit: 'ML' },
      'Water_Stress_Areas': { esrs: 'E3_4_WATER_STRESS_AREAS', unit: 'ML' },
      'Collective_Bargaining': { esrs: 'S1_8_COLLECTIVE_BARGAINING_PCT', unit: '%' },
    };

    return rows
      .filter((row) => mapping[row.measure])
      .map((row) => {
        const map = mapping[row.measure];
        return {
          ...period,
          metricCode: map.esrs,
          value: { numeric: row.value },
          unit: map.unit,
          confidenceLevel: 'calculated' as const,
          sourceReference: `powerbi:${p.datasetId}:${row.department}`,
        };
      });
  }
}
