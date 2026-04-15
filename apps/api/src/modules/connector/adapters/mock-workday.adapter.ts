import type { IConnectorAdapter, NormalizedMetricValue, AdapterValidationResult } from './connector-adapter.port';

/**
 * Workday HCM REST API Response Format.
 * Real API: /ccx/api/v1/workers, /ccx/api/analytics/v1/reports
 * Workday uses a proprietary REST API (not OData) with RAAS reports.
 */
interface WorkdayPayload {
  Report_Entry: Array<{
    Worker_Group: string;
    Metric_ID: string;
    Metric_Name: string;
    Value: number | boolean | string;
    Unit: string;
    Effective_Date: string;
  }>;
  Report_Name: string;
  Report_Date: string;
  Organization: { Organization_ID: string; Organization_Name: string };
}

export class MockWorkdayAdapter implements IConnectorAdapter {
  readonly connectorType = 'mock_workday';
  readonly displayName = 'Workday (Mock)';

  static generatePayload(): WorkdayPayload {
    return {
      Report_Name: 'ESRS_Workforce_Export_FY2024',
      Report_Date: '2025-01-31',
      Organization: { Organization_ID: 'ACME_GLOBAL', Organization_Name: 'Acme Corporation' },
      Report_Entry: [
        { Worker_Group: 'All Workers', Metric_ID: 'WD-HC-FT', Metric_Name: 'Full-Time Headcount', Value: 31050, Unit: 'Count', Effective_Date: '2024-12-31' },
        { Worker_Group: 'All Workers', Metric_ID: 'WD-HC-PT', Metric_Name: 'Part-Time Headcount', Value: 3450, Unit: 'Count', Effective_Date: '2024-12-31' },
        { Worker_Group: 'Contingent Workers', Metric_ID: 'WD-CW-TOTAL', Metric_Name: 'Contingent Worker Count', Value: 4200, Unit: 'Count', Effective_Date: '2024-12-31' },
        { Worker_Group: 'All Workers', Metric_ID: 'WD-COMP-ADEQUATE', Metric_Name: 'Adequate Wages Compliance', Value: true, Unit: 'Boolean', Effective_Date: '2024-12-31' },
        { Worker_Group: 'All Workers', Metric_ID: 'WD-DEI-DISABILITY', Metric_Name: 'Disability Disclosure Rate', Value: 3.8, Unit: 'Percent', Effective_Date: '2024-12-31' },
        { Worker_Group: 'All Workers', Metric_ID: 'WD-LEAVE-ENTITLED', Metric_Name: 'Family Leave Entitlement Rate', Value: 100, Unit: 'Percent', Effective_Date: '2024-12-31' },
        { Worker_Group: 'All Workers', Metric_ID: 'WD-LRN-HOURS', Metric_Name: 'Total Learning Hours', Value: 845250, Unit: 'Hours', Effective_Date: '2024-12-31' },
        { Worker_Group: 'All Workers', Metric_ID: 'WD-TERM-INVOL', Metric_Name: 'Involuntary Termination Rate', Value: 2.1, Unit: 'Percent', Effective_Date: '2024-12-31' },
        { Worker_Group: 'Executive', Metric_ID: 'WD-COMP-RATIO', Metric_Name: 'CEO-to-Median Pay Ratio', Value: 42, Unit: 'Ratio', Effective_Date: '2024-12-31' },
      ],
    };
  }

  validatePayload(raw: unknown): AdapterValidationResult { return { valid: true, errors: [] }; }

  transformToMetrics(_raw: unknown): NormalizedMetricValue[] {
    const p = MockWorkdayAdapter.generatePayload();
    const period = { periodStart: '2024-01-01', periodEnd: '2024-12-31' };
    const ref = `workday:${p.Organization.Organization_ID}`;

    // Map Workday Metric IDs to ESRS codes
    const mapping: Record<string, { esrs: string; unit: string }> = {
      'WD-HC-FT': { esrs: 'S1_6_EMPLOYEES_FULLTIME', unit: 'headcount' },
      'WD-HC-PT': { esrs: 'S1_6_EMPLOYEES_PARTTIME', unit: 'headcount' },
      'WD-CW-TOTAL': { esrs: 'S1_7_NONEMPLOYEE_WORKERS', unit: 'headcount' },
      'WD-DEI-DISABILITY': { esrs: 'S1_12_DISABILITY_PCT', unit: '%' },
      'WD-LEAVE-ENTITLED': { esrs: 'S1_15_FAMILY_LEAVE_ENTITLED_PCT', unit: '%' },
      'WD-LRN-HOURS': { esrs: 'S1_13_TRAINING_HOURS_TOTAL', unit: 'hours' },
      'WD-TERM-INVOL': { esrs: 'S1_6_INVOLUNTARY_TURNOVER_RATE', unit: '%' },
      'WD-COMP-RATIO': { esrs: 'S1_16_CEO_PAY_RATIO', unit: 'ratio' },
    };

    const results: NormalizedMetricValue[] = [];
    for (const entry of p.Report_Entry) {
      const map = mapping[entry.Metric_ID];
      if (map) {
        results.push({
          ...period,
          metricCode: map.esrs,
          value: typeof entry.Value === 'boolean' ? { boolean: entry.Value } : { numeric: entry.Value as number },
          unit: map.unit,
          confidenceLevel: 'measured',
          sourceReference: ref,
        });
      } else if (entry.Metric_ID === 'WD-COMP-ADEQUATE') {
        results.push({
          ...period, metricCode: 'S1_10_ADEQUATE_WAGES',
          value: { boolean: entry.Value as boolean }, confidenceLevel: 'measured', sourceReference: ref,
        });
      }
    }
    return results;
  }
}
