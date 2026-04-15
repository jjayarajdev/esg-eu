import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Celonis Process Mining API Response Format.
 * Real API: /integration/api/v1/data-pools, /process-analytics/api/analysis
 * Celonis mines operational data from ERP/MES systems to surface
 * process inefficiencies, including environmental and safety metrics.
 */
interface CelonisPayload {
  analysisExport: {
    analysisId: string;
    dataPoolId: string;
    exportDate: string;
    processScope: string;
  };
  operationalInsights: {
    waterManagement: {
      recycledVolume_ML: number;
      waterIntensity_MLPerMRevenue: number;
      processWaterEfficiency: number;
    };
    wasteFromProcesses: {
      nonHazardousWaste_tonnes: number;
      processWasteReduction_pct: number;
    };
    energyFromProcesses: {
      nonRenewableConsumption_MWh: number;
      processEnergyEfficiency: number;
    };
    safetyFromProcessAnalysis: {
      recordableIncidents: number;
      daysLostToInjury: number;
      occupationalDiseases: number;
      nearMisses: number;
      safetyObservations: number;
    };
  };
}

export class MockCelonisAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_celonis';
  readonly displayName = 'Celonis (Mock)';

  static generatePayload(): CelonisPayload {
    return {
      analysisExport: {
        analysisId: 'CEL-ESG-2024-Q4', dataPoolId: 'dp-acme-prod',
        exportDate: '2025-01-20T16:00:00Z', processScope: 'Manufacturing + Logistics',
      },
      operationalInsights: {
        waterManagement: { recycledVolume_ML: 5.8, waterIntensity_MLPerMRevenue: 1.16, processWaterEfficiency: 82 },
        wasteFromProcesses: { nonHazardousWaste_tonnes: 13700, processWasteReduction_pct: 8.5 },
        energyFromProcesses: { nonRenewableConsumption_MWh: 510000, processEnergyEfficiency: 76 },
        safetyFromProcessAnalysis: {
          recordableIncidents: 23, daysLostToInjury: 412,
          occupationalDiseases: 5, nearMisses: 142, safetyObservations: 3200,
        },
      },
    };
  }

  validatePayload(raw: unknown): AdapterValidationResult { return { valid: true, errors: [] }; }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    const p = MockCelonisAdapter.generatePayload().operationalInsights;
    const period = { periodStart: '2024-01-01', periodEnd: '2024-12-31' };
    return [
      { ...period, metricCode: 'E3_4_WATER_RECYCLED', value: { numeric: p.waterManagement.recycledVolume_ML }, unit: 'ML', confidenceLevel: 'calculated', sourceReference: 'celonis:water_process' },
      { ...period, metricCode: 'E3_4_WATER_INTENSITY', value: { numeric: p.waterManagement.waterIntensity_MLPerMRevenue }, unit: 'ML/EUR M', confidenceLevel: 'calculated', sourceReference: 'celonis:water_process' },
      { ...period, metricCode: 'E5_5_WASTE_NONHAZARDOUS', value: { numeric: p.wasteFromProcesses.nonHazardousWaste_tonnes }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'celonis:waste_process' },
      { ...period, metricCode: 'E1_5_ENERGY_CONSUMPTION_NONRENEWABLE', value: { numeric: p.energyFromProcesses.nonRenewableConsumption_MWh }, unit: 'MWh', confidenceLevel: 'measured', sourceReference: 'celonis:energy_process' },
      { ...period, metricCode: 'S1_14_RECORDABLE_INCIDENTS', value: { numeric: p.safetyFromProcessAnalysis.recordableIncidents }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'celonis:safety_analysis' },
      { ...period, metricCode: 'S1_14_DAYS_LOST', value: { numeric: p.safetyFromProcessAnalysis.daysLostToInjury }, unit: 'days', confidenceLevel: 'measured', sourceReference: 'celonis:safety_analysis' },
      { ...period, metricCode: 'S1_14_OCCUPATIONAL_DISEASE', value: { numeric: p.safetyFromProcessAnalysis.occupationalDiseases }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'celonis:safety_analysis' },
    ];
  }
}
