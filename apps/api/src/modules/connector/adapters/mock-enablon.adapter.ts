import type {
  IConnectorAdapter,
  NormalizedMetricValue,
  AdapterValidationResult,
} from './connector-adapter.port';

/**
 * Enablon (Wolters Kluwer) EHS Platform API Response Format.
 * Real Enablon exposes REST APIs for environmental data:
 *   /api/v1/indicators, /api/v1/facilities, /api/v1/emissions
 * This mock simulates the consolidated environmental performance export.
 */
interface EnablonPayload {
  exportMetadata: {
    systemId: string;
    exportDate: string;
    consolidationLevel: 'corporate' | 'division' | 'site';
    reportingYear: number;
  };
  emissions: {
    ghgScope1: {
      total_tCO2e: number;
      bySite: Array<{ siteId: string; siteName: string; country: string; value: number }>;
      methodology: string;
      verificationStatus: 'verified' | 'unverified' | 'pending';
    };
    ghgScope2: {
      locationBased_tCO2e: number;
      marketBased_tCO2e: number;
      gridFactorSource: string;
    };
    ghgScope3: {
      total_tCO2e: number;
      byCategory: Array<{ categoryId: number; categoryName: string; value: number }>;
    };
    totalGhg_tCO2e: number;
  };
  energy: {
    totalConsumption_MWh: number;
    renewable_MWh: number;
    nonRenewable_MWh: number;
    renewablePercentage: number;
    bySource: Array<{ sourceType: string; value_MWh: number }>;
  };
  water: {
    totalWithdrawal_ML: number;
    totalConsumption_ML: number;
    totalDischarge_ML: number;
    recycled_ML: number;
    bySource: Array<{ source: string; withdrawal_ML: number }>;
  };
  waste: {
    totalGenerated_tonnes: number;
    hazardous_tonnes: number;
    nonHazardous_tonnes: number;
    recycled_tonnes: number;
    landfill_tonnes: number;
    recyclingRate: number;
  };
  pollution: {
    airEmissions: {
      NOx_tonnes: number; SOx_tonnes: number; PM_tonnes: number; VOC_tonnes: number;
      total_tonnes: number;
    };
    waterDischarges: {
      COD_tonnes: number; BOD_tonnes: number; TSS_tonnes: number;
      total_tonnes: number;
    };
  };
}

export class MockEnablonAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_enablon';
  readonly displayName = 'Enablon (Mock)';

  static generatePayload(): EnablonPayload {
    return {
      exportMetadata: {
        systemId: 'ENABLON-EU-PROD',
        exportDate: '2025-02-15T08:30:00Z',
        consolidationLevel: 'corporate',
        reportingYear: 2024,
      },
      emissions: {
        ghgScope1: {
          total_tCO2e: 12500,
          bySite: [
            { siteId: 'NL-AMS-01', siteName: 'Amsterdam Plant', country: 'NL', value: 4200 },
            { siteId: 'DE-HAM-01', siteName: 'Hamburg Factory', country: 'DE', value: 3800 },
            { siteId: 'FR-LYO-01', siteName: 'Lyon Facility', country: 'FR', value: 2500 },
            { siteId: 'UK-MAN-01', siteName: 'Manchester Site', country: 'GB', value: 2000 },
          ],
          methodology: 'GHG Protocol Corporate Standard (2004)',
          verificationStatus: 'verified',
        },
        ghgScope2: {
          locationBased_tCO2e: 45000,
          marketBased_tCO2e: 38000,
          gridFactorSource: 'IEA 2024 Emission Factors',
        },
        ghgScope3: {
          total_tCO2e: 185000,
          byCategory: [
            { categoryId: 1, categoryName: 'Purchased goods and services', value: 98000 },
            { categoryId: 3, categoryName: 'Fuel and energy-related activities', value: 15000 },
            { categoryId: 4, categoryName: 'Upstream transportation', value: 22000 },
            { categoryId: 11, categoryName: 'Use of sold products', value: 35000 },
            { categoryId: 12, categoryName: 'End-of-life treatment', value: 15000 },
          ],
        },
        totalGhg_tCO2e: 242500,
      },
      energy: {
        totalConsumption_MWh: 850000,
        renewable_MWh: 340000,
        nonRenewable_MWh: 510000,
        renewablePercentage: 40,
        bySource: [
          { sourceType: 'Natural Gas', value_MWh: 320000 },
          { sourceType: 'Grid Electricity', value_MWh: 190000 },
          { sourceType: 'Solar PV', value_MWh: 85000 },
          { sourceType: 'Wind (PPAs)', value_MWh: 155000 },
          { sourceType: 'Biomass', value_MWh: 100000 },
        ],
      },
      water: {
        totalWithdrawal_ML: 18.2,
        totalConsumption_ML: 12.5,
        totalDischarge_ML: 5.7,
        recycled_ML: 5.8,
        bySource: [
          { source: 'Municipal supply', withdrawal_ML: 10.5 },
          { source: 'Groundwater', withdrawal_ML: 5.2 },
          { source: 'Surface water', withdrawal_ML: 2.5 },
        ],
      },
      waste: {
        totalGenerated_tonnes: 15800,
        hazardous_tonnes: 2100,
        nonHazardous_tonnes: 13700,
        recycled_tonnes: 11376,
        landfill_tonnes: 4424,
        recyclingRate: 72,
      },
      pollution: {
        airEmissions: { NOx_tonnes: 120, SOx_tonnes: 45, PM_tonnes: 35, VOC_tonnes: 120, total_tonnes: 320 },
        waterDischarges: { COD_tonnes: 22, BOD_tonnes: 12, TSS_tonnes: 11, total_tonnes: 45 },
      },
    };
  }

  validatePayload(raw: unknown): AdapterValidationResult {
    return { valid: true, errors: [] };
  }

  transformToMetrics(raw: unknown): NormalizedMetricValue[] {
    const p = MockEnablonAdapter.generatePayload();
    const period = { periodStart: '2024-01-01', periodEnd: '2024-12-31' };

    return [
      // GHG Emissions
      { ...period, metricCode: 'E1_6_GHG_SCOPE1', value: { numeric: p.emissions.ghgScope1.total_tCO2e }, unit: 'tCO2e', confidenceLevel: 'measured', sourceReference: `enablon:${p.emissions.ghgScope1.verificationStatus}` },
      { ...period, metricCode: 'E1_6_GHG_SCOPE2_LOCATION', value: { numeric: p.emissions.ghgScope2.locationBased_tCO2e }, unit: 'tCO2e', confidenceLevel: 'measured', sourceReference: `enablon:${p.emissions.ghgScope2.gridFactorSource}` },
      { ...period, metricCode: 'E1_6_GHG_SCOPE2_MARKET', value: { numeric: p.emissions.ghgScope2.marketBased_tCO2e }, unit: 'tCO2e', confidenceLevel: 'calculated', sourceReference: 'enablon:market_instruments' },
      { ...period, metricCode: 'E1_6_GHG_SCOPE3_TOTAL', value: { numeric: p.emissions.ghgScope3.total_tCO2e }, unit: 'tCO2e', confidenceLevel: 'estimated', sourceReference: 'enablon:scope3_model' },
      { ...period, metricCode: 'E1_6_GHG_TOTAL', value: { numeric: p.emissions.totalGhg_tCO2e }, unit: 'tCO2e', confidenceLevel: 'calculated', sourceReference: 'enablon:consolidated' },

      // Energy
      { ...period, metricCode: 'E1_5_ENERGY_CONSUMPTION_TOTAL', value: { numeric: p.energy.totalConsumption_MWh }, unit: 'MWh', confidenceLevel: 'measured', sourceReference: 'enablon:energy_module' },
      { ...period, metricCode: 'E1_5_ENERGY_CONSUMPTION_RENEWABLE', value: { numeric: p.energy.renewable_MWh }, unit: 'MWh', confidenceLevel: 'measured', sourceReference: 'enablon:energy_module' },
      { ...period, metricCode: 'E1_5_ENERGY_RENEWABLE_PCT', value: { numeric: p.energy.renewablePercentage }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'enablon:energy_module' },

      // Pollution
      { ...period, metricCode: 'E2_4_AIR_POLLUTANTS', value: { numeric: p.pollution.airEmissions.total_tonnes }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'enablon:air_emissions' },
      { ...period, metricCode: 'E2_4_WATER_POLLUTANTS', value: { numeric: p.pollution.waterDischarges.total_tonnes }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'enablon:water_quality' },

      // Water
      { ...period, metricCode: 'E3_4_WATER_CONSUMPTION_TOTAL', value: { numeric: p.water.totalConsumption_ML }, unit: 'ML', confidenceLevel: 'measured', sourceReference: 'enablon:water_module' },
      { ...period, metricCode: 'E3_4_WATER_WITHDRAWAL_TOTAL', value: { numeric: p.water.totalWithdrawal_ML }, unit: 'ML', confidenceLevel: 'measured', sourceReference: 'enablon:water_module' },

      // Waste
      { ...period, metricCode: 'E5_5_WASTE_TOTAL', value: { numeric: p.waste.totalGenerated_tonnes }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'enablon:waste_module' },
      { ...period, metricCode: 'E5_5_WASTE_HAZARDOUS', value: { numeric: p.waste.hazardous_tonnes }, unit: 'tonnes', confidenceLevel: 'measured', sourceReference: 'enablon:waste_module' },
      { ...period, metricCode: 'E5_5_WASTE_RECYCLING_RATE', value: { numeric: p.waste.recyclingRate }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'enablon:waste_module' },
    ];
  }
}
