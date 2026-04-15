import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * NAVEX EthicsPoint (now NAVEX One) API.
 * Real API: /api/v2/cases, /api/v2/analytics/summary
 * Whistleblower hotline and ethics case management platform.
 */
interface EthicsPointPayload {
  reportSummary: {
    generatedAt: string;
    reportingPeriod: { startDate: string; endDate: string };
    organization: { orgId: string; orgName: string };
  };
  caseMetrics: {
    totalReportsReceived: number;
    totalReportsClosed: number;
    totalReportsOpen: number;
    averageResolutionDays: number;
    byCategory: Array<{ category: string; count: number; substantiated: number }>;
    anonymousReports: number;
    retaliation: { complaints: number; substantiated: number };
  };
  complianceTraining: {
    codeOfConductTraining: { enrolled: number; completed: number; completionRate: number };
    antiCorruptionTraining: { enrolled: number; completed: number; completionRate: number };
    antiHarassmentTraining: { enrolled: number; completed: number; completionRate: number };
  };
  corruptionMetrics: {
    confirmedIncidents: number;
    pendingInvestigations: number;
    legalActionsInitiated: number;
    financialLosses: number;
  };
  politicalActivity: {
    politicalDonations_EUR: number;
    lobbyingExpenditure_EUR: number;
    tradeAssociationDues_EUR: number;
  };
  paymentPractices: {
    averagePaymentTerms_days: number;
    onTimePaymentRate: number;
    daysPayableOutstanding: number;
    latePaymentPenalties_EUR: number;
  };
}

export class MockEthicsPointAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_ethicspoint';
  readonly displayName = 'EthicsPoint (Mock)';

  static generatePayload(): EthicsPointPayload {
    return {
      reportSummary: {
        generatedAt: '2025-01-15T10:00:00Z',
        reportingPeriod: { startDate: '2024-01-01', endDate: '2024-12-31' },
        organization: { orgId: 'ACME-GLOBAL', orgName: 'Acme Corporation' },
      },
      caseMetrics: {
        totalReportsReceived: 42,
        totalReportsClosed: 38,
        totalReportsOpen: 4,
        averageResolutionDays: 28,
        byCategory: [
          { category: 'Workplace conduct', count: 15, substantiated: 8 },
          { category: 'Financial irregularity', count: 8, substantiated: 3 },
          { category: 'Conflict of interest', count: 7, substantiated: 4 },
          { category: 'Discrimination', count: 6, substantiated: 2 },
          { category: 'Environmental concern', count: 4, substantiated: 2 },
          { category: 'Other', count: 2, substantiated: 1 },
        ],
        anonymousReports: 18,
        retaliation: { complaints: 1, substantiated: 0 },
      },
      complianceTraining: {
        codeOfConductTraining: { enrolled: 34500, completed: 32430, completionRate: 94 },
        antiCorruptionTraining: { enrolled: 34500, completed: 31395, completionRate: 91 },
        antiHarassmentTraining: { enrolled: 34500, completed: 33120, completionRate: 96 },
      },
      corruptionMetrics: {
        confirmedIncidents: 1, pendingInvestigations: 2,
        legalActionsInitiated: 0, financialLosses: 45000,
      },
      politicalActivity: {
        politicalDonations_EUR: 0,
        lobbyingExpenditure_EUR: 185000,
        tradeAssociationDues_EUR: 320000,
      },
      paymentPractices: {
        averagePaymentTerms_days: 45,
        onTimePaymentRate: 87,
        daysPayableOutstanding: 52,
        latePaymentPenalties_EUR: 12000,
      },
    };
  }

  validatePayload(raw: unknown): AdapterValidationResult { return { valid: true, errors: [] }; }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    const p = MockEthicsPointAdapter.generatePayload();
    const period = { periodStart: '2024-01-01', periodEnd: '2024-12-31' };
    return [
      { ...period, metricCode: 'G1_1_WHISTLEBLOWER_REPORTS', value: { numeric: p.caseMetrics.totalReportsReceived }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ethicspoint:case_mgmt' },
      { ...period, metricCode: 'G1_1_WHISTLEBLOWER_RESOLVED', value: { numeric: p.caseMetrics.totalReportsClosed }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ethicspoint:case_mgmt' },
      { ...period, metricCode: 'G1_1_CODE_TRAINING_PCT', value: { numeric: p.complianceTraining.codeOfConductTraining.completionRate }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'ethicspoint:lms' },
      { ...period, metricCode: 'G1_3_ANTICORRUPTION_TRAINING_PCT', value: { numeric: p.complianceTraining.antiCorruptionTraining.completionRate }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'ethicspoint:lms' },
      { ...period, metricCode: 'G1_4_CORRUPTION_INCIDENTS', value: { numeric: p.corruptionMetrics.confirmedIncidents }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ethicspoint:investigations' },
      { ...period, metricCode: 'G1_4_CORRUPTION_LEGAL_ACTIONS', value: { numeric: p.corruptionMetrics.legalActionsInitiated }, unit: 'count', confidenceLevel: 'measured', sourceReference: 'ethicspoint:legal' },
      { ...period, metricCode: 'G1_5_POLITICAL_DONATIONS', value: { numeric: p.politicalActivity.politicalDonations_EUR }, unit: 'EUR', confidenceLevel: 'measured', sourceReference: 'ethicspoint:political' },
      { ...period, metricCode: 'G1_5_LOBBYING_SPEND', value: { numeric: p.politicalActivity.lobbyingExpenditure_EUR }, unit: 'EUR', confidenceLevel: 'measured', sourceReference: 'ethicspoint:political' },
      { ...period, metricCode: 'G1_6_PAYMENT_TERMS_DAYS', value: { numeric: p.paymentPractices.averagePaymentTerms_days }, unit: 'days', confidenceLevel: 'measured', sourceReference: 'ethicspoint:ap_analytics' },
      { ...period, metricCode: 'G1_6_ONTIME_PAYMENT_PCT', value: { numeric: p.paymentPractices.onTimePaymentRate }, unit: '%', confidenceLevel: 'calculated', sourceReference: 'ethicspoint:ap_analytics' },
      { ...period, metricCode: 'G1_6_DPO', value: { numeric: p.paymentPractices.daysPayableOutstanding }, unit: 'days', confidenceLevel: 'calculated', sourceReference: 'ethicspoint:ap_analytics' },
    ];
  }
}
