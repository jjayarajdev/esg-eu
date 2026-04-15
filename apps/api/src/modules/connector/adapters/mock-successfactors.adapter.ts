import type {
  IConnectorAdapter,
  NormalizedMetricValue,
  AdapterValidationResult,
} from './connector-adapter.port';

/**
 * SAP SuccessFactors OData API Response Format.
 * Real SF uses OData v2 with $metadata entities like:
 *   /odata/v2/User, /odata/v2/EmpEmployment, /odata/v2/FODivision
 * This mock simulates the aggregated workforce analytics export
 * from SF People Analytics / Workforce Analytics module.
 */
interface SFWorkforcePayload {
  d: {
    __metadata: { uri: string; type: string };
    reportingPeriod: string;
    organizationId: string;
    organizationName: string;
    snapshot: {
      headcount: {
        total: number;
        byGender: { male: number; female: number; nonBinary: number; undisclosed: number };
        byContractType: { permanent: number; temporary: number; fixedTerm: number };
        byWorkSchedule: { fullTime: number; partTime: number };
        byAgeGroup: { under30: number; age30to50: number; over50: number };
        byRegion: Array<{ regionCode: string; regionName: string; count: number }>;
      };
      nonEmployeeWorkers: {
        contractors: number;
        agencyWorkers: number;
        total: number;
      };
      diversity: {
        womenInManagement: number;
        womenOnBoard: number;
        disabilityRate: number;
      };
      turnover: {
        voluntaryTerminations: number;
        involuntaryTerminations: number;
        voluntaryRate: number;
        involuntaryRate: number;
        totalRate: number;
      };
      compensation: {
        genderPayGap: number;
        ceoToMedianRatio: number;
        minimumWageCompliance: boolean;
        collectiveBargainingCoverage: number;
      };
      training: {
        totalHoursDelivered: number;
        averageHoursPerEmployee: number;
        participationRate: number;
        completionRate: number;
      };
      healthAndSafety: {
        fatalities: number;
        recordableIncidents: number;
        lostTimeInjuries: number;
        totalRecordableIncidentRate: number;
        lostTimeInjuryFrequencyRate: number;
        daysLostToInjury: number;
        occupationalDiseases: number;
      };
      workLifeBalance: {
        familyLeaveEntitled: number;
        familyLeaveUsed: number;
        entitlementRate: number;
      };
      socialProtection: {
        adequateWages: boolean;
      };
    };
  };
}

export class MockSuccessFactorsAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_successfactors';
  readonly displayName = 'SAP SuccessFactors (Mock)';

  /** Generate a realistic SF OData response */
  static generatePayload(): SFWorkforcePayload {
    return {
      d: {
        __metadata: {
          uri: "https://api.successfactors.eu/odata/v2/WorkforceAnalytics('2024')",
          type: 'SFOData.WorkforceAnalyticsResult',
        },
        reportingPeriod: '2024',
        organizationId: 'ACME_EU',
        organizationName: 'Acme Corporation Europe',
        snapshot: {
          headcount: {
            total: 34500,
            byGender: { male: 22080, female: 12420, nonBinary: 0, undisclosed: 0 },
            byContractType: { permanent: 31050, temporary: 2450, fixedTerm: 1000 },
            byWorkSchedule: { fullTime: 31050, partTime: 3450 },
            byAgeGroup: { under30: 6210, age30to50: 18975, over50: 9315 },
            byRegion: [
              { regionCode: 'EU-WEST', regionName: 'Western Europe', count: 18400 },
              { regionCode: 'EU-EAST', regionName: 'Eastern Europe', count: 5200 },
              { regionCode: 'APAC', regionName: 'Asia Pacific', count: 6900 },
              { regionCode: 'AMER', regionName: 'Americas', count: 4000 },
            ],
          },
          nonEmployeeWorkers: { contractors: 2800, agencyWorkers: 1400, total: 4200 },
          diversity: { womenInManagement: 32, womenOnBoard: 40, disabilityRate: 3.8 },
          turnover: {
            voluntaryTerminations: 2829, involuntaryTerminations: 725,
            voluntaryRate: 8.2, involuntaryRate: 2.1, totalRate: 10.3,
          },
          compensation: {
            genderPayGap: 4.2, ceoToMedianRatio: 42,
            minimumWageCompliance: true, collectiveBargainingCoverage: 65,
          },
          training: {
            totalHoursDelivered: 845250, averageHoursPerEmployee: 24.5,
            participationRate: 92, completionRate: 87,
          },
          healthAndSafety: {
            fatalities: 0, recordableIncidents: 23, lostTimeInjuries: 12,
            totalRecordableIncidentRate: 0.42, lostTimeInjuryFrequencyRate: 0.18,
            daysLostToInjury: 412, occupationalDiseases: 5,
          },
          workLifeBalance: { familyLeaveEntitled: 34500, familyLeaveUsed: 4820, entitlementRate: 100 },
          socialProtection: { adequateWages: true },
        },
      },
    };
  }

  validatePayload(raw: unknown): AdapterValidationResult {
    // In real mode, validate OData structure. In mock mode, accept anything.
    return { valid: true, errors: [] };
  }

  transformToMetrics(raw: unknown): NormalizedMetricValue[] {
    // Use realistic payload (ignore the incoming `raw` in mock mode)
    const payload = MockSuccessFactorsAdapter.generatePayload();
    const s = payload.d.snapshot;
    const period = { periodStart: '2024-01-01', periodEnd: '2024-12-31' };

    return [
      // Headcount
      { ...period, metricCode: 'S1_6_EMPLOYEES_TOTAL', value: { numeric: s.headcount.total }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: `sf:${payload.d.organizationId}` },
      { ...period, metricCode: 'S1_6_EMPLOYEES_FEMALE', value: { numeric: s.headcount.byGender.female }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: `sf:${payload.d.organizationId}` },
      { ...period, metricCode: 'S1_6_EMPLOYEES_MALE', value: { numeric: s.headcount.byGender.male }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: `sf:${payload.d.organizationId}` },
      { ...period, metricCode: 'S1_6_EMPLOYEES_PERMANENT', value: { numeric: s.headcount.byContractType.permanent }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: `sf:${payload.d.organizationId}` },
      { ...period, metricCode: 'S1_6_EMPLOYEES_TEMPORARY', value: { numeric: s.headcount.byContractType.temporary + s.headcount.byContractType.fixedTerm }, unit: 'headcount', confidenceLevel: 'measured', sourceReference: `sf:${payload.d.organizationId}` },

      // Turnover
      { ...period, metricCode: 'S1_6_VOLUNTARY_TURNOVER_RATE', value: { numeric: s.turnover.voluntaryRate }, unit: '%', confidenceLevel: 'calculated', sourceReference: `sf:turnover_analytics` },

      // Collective bargaining
      { ...period, metricCode: 'S1_8_COLLECTIVE_BARGAINING_PCT', value: { numeric: s.compensation.collectiveBargainingCoverage }, unit: '%', confidenceLevel: 'measured', sourceReference: `sf:compensation_module` },

      // Diversity
      { ...period, metricCode: 'S1_9_WOMEN_MANAGEMENT_PCT', value: { numeric: s.diversity.womenInManagement }, unit: '%', confidenceLevel: 'calculated', sourceReference: `sf:diversity_dashboard` },
      { ...period, metricCode: 'S1_9_WOMEN_BOARD_PCT', value: { numeric: s.diversity.womenOnBoard }, unit: '%', confidenceLevel: 'measured', sourceReference: `sf:board_composition` },
      { ...period, metricCode: 'S1_9_AGE_UNDER30_PCT', value: { numeric: Math.round(s.headcount.byAgeGroup.under30 / s.headcount.total * 100) }, unit: '%', confidenceLevel: 'calculated', sourceReference: `sf:demographics` },
      { ...period, metricCode: 'S1_9_AGE_30TO50_PCT', value: { numeric: Math.round(s.headcount.byAgeGroup.age30to50 / s.headcount.total * 100) }, unit: '%', confidenceLevel: 'calculated', sourceReference: `sf:demographics` },
      { ...period, metricCode: 'S1_9_AGE_OVER50_PCT', value: { numeric: Math.round(s.headcount.byAgeGroup.over50 / s.headcount.total * 100) }, unit: '%', confidenceLevel: 'calculated', sourceReference: `sf:demographics` },

      // Training
      { ...period, metricCode: 'S1_13_TRAINING_HOURS_PER_EMPLOYEE', value: { numeric: s.training.averageHoursPerEmployee }, unit: 'hours/employee', confidenceLevel: 'calculated', sourceReference: `sf:learning_module` },

      // Health & Safety
      { ...period, metricCode: 'S1_14_FATALITIES', value: { numeric: s.healthAndSafety.fatalities }, unit: 'count', confidenceLevel: 'measured', sourceReference: `sf:ehs_module` },
      { ...period, metricCode: 'S1_14_TRIR', value: { numeric: s.healthAndSafety.totalRecordableIncidentRate }, unit: 'rate', confidenceLevel: 'calculated', sourceReference: `sf:ehs_module` },
      { ...period, metricCode: 'S1_14_LOST_TIME_INJURY_RATE', value: { numeric: s.healthAndSafety.lostTimeInjuryFrequencyRate }, unit: 'rate', confidenceLevel: 'calculated', sourceReference: `sf:ehs_module` },

      // Pay equity
      { ...period, metricCode: 'S1_16_GENDER_PAY_GAP', value: { numeric: s.compensation.genderPayGap }, unit: '%', confidenceLevel: 'calculated', sourceReference: `sf:compensation_analytics` },
    ];
  }
}
