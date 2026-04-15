import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * CDP (Carbon Disclosure Project) API Response Format.
 * Real API: https://api.cdp.net/v1/responses, /v1/scores
 * CDP collects climate, water, and forest disclosure data from companies
 * on behalf of investors and purchasing organizations.
 */
interface CdpPayload {
  responseMetadata: { accountId: string; organizationName: string; reportingYear: number; questionnaire: string; submissionDate: string; score: string };
  governance: {
    boardOversight: boolean;
    dedicatedCommittee: boolean;
    sustainabilityIncentives: boolean;
    incentivePercentage: number;
    highestGovernanceBody: string;
  };
  targets: {
    hasScienceBasedTarget: boolean;
    targetType: string;
    baseYear: number;
    targetYear: number;
    reductionPercentage: number;
    scope: string;
    status: string;
  };
  transitionPlan: {
    hasTransitionPlan: boolean;
    alignedWith15C: boolean;
    lastUpdated: string;
  };
}

export class MockCdpAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_cdp';
  readonly displayName = 'CDP (Mock)';

  static generatePayload(): CdpPayload {
    return {
      responseMetadata: {
        accountId: 'CDP-ACME-2024', organizationName: 'Acme Corporation',
        reportingYear: 2024, questionnaire: 'Climate Change 2024',
        submissionDate: '2024-07-31', score: 'A-',
      },
      governance: {
        boardOversight: true, dedicatedCommittee: true,
        sustainabilityIncentives: true, incentivePercentage: 15,
        highestGovernanceBody: 'Board of Directors',
      },
      targets: {
        'hasScienceBasedTarget': true, targetType: 'Absolute',
        baseYear: 2019, targetYear: 2030,
        reductionPercentage: 42, scope: 'Scope 1+2',
        status: 'Targets set - validated by SBTi',
      },
      transitionPlan: { hasTransitionPlan: true, alignedWith15C: true, lastUpdated: '2024-03-15' },
    };
  }

  validatePayload(raw: unknown): AdapterValidationResult { return { valid: true, errors: [] }; }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    const p = MockCdpAdapter.generatePayload();
    const period = { periodStart: '2024-01-01', periodEnd: '2024-12-31' };
    const ref = `cdp:${p.responseMetadata.accountId}`;
    return [
      { ...period, metricCode: 'E1_1_TRANSITION_PLAN_ALIGNED', value: { boolean: p.transitionPlan.alignedWith15C }, confidenceLevel: 'measured', sourceReference: ref },
      { ...period, metricCode: 'E1_4_GHG_REDUCTION_TARGET_PCT', value: { numeric: p.targets.reductionPercentage }, unit: '%', confidenceLevel: 'measured', sourceReference: `cdp:sbti_validated` },
      { ...period, metricCode: 'E1_4_GHG_TARGET_YEAR', value: { numeric: p.targets.targetYear }, unit: 'year', confidenceLevel: 'measured', sourceReference: ref },
      { ...period, metricCode: 'ESRS2_GOV1_BOARD_SUSTAINABILITY_OVERSIGHT', value: { boolean: p.governance.boardOversight }, confidenceLevel: 'measured', sourceReference: `cdp:governance` },
      { ...period, metricCode: 'ESRS2_GOV1_SUSTAINABILITY_COMMITTEE', value: { boolean: p.governance.dedicatedCommittee }, confidenceLevel: 'measured', sourceReference: `cdp:governance` },
      { ...period, metricCode: 'ESRS2_GOV3_SUSTAINABILITY_REMUNERATION', value: { boolean: p.governance.sustainabilityIncentives }, confidenceLevel: 'measured', sourceReference: `cdp:governance` },
      { ...period, metricCode: 'ESRS2_GOV3_SUSTAINABILITY_REMUNERATION_PCT', value: { numeric: p.governance.incentivePercentage }, unit: '%', confidenceLevel: 'measured', sourceReference: `cdp:governance` },
    ];
  }
}
