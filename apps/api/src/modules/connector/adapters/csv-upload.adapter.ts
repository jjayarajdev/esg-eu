import { getMetricByCode } from '@esg/esrs-taxonomy';
import type {
  IConnectorAdapter,
  NormalizedMetricValue,
  AdapterValidationResult,
} from './connector-adapter.port';

interface CsvRow {
  metric_code: string;
  value: string;
  period_start: string;
  period_end: string;
  unit?: string;
  confidence_level?: string;
}

/**
 * CSV Upload Adapter.
 * Accepts an array of parsed CSV rows with columns:
 *   metric_code, value, period_start, period_end, unit, confidence_level
 *
 * The CSV parsing itself happens in the controller (using a streaming parser).
 * This adapter validates and transforms the parsed rows.
 */
export class CsvUploadAdapter implements IConnectorAdapter {
  readonly connectorType = 'csv_upload';
  readonly displayName = 'CSV File Upload';

  validatePayload(raw: unknown): AdapterValidationResult {
    if (!Array.isArray(raw)) {
      return { valid: false, errors: ['Payload must be an array of rows'] };
    }

    const errors: string[] = [];
    for (let i = 0; i < raw.length; i++) {
      const row = raw[i] as CsvRow;
      if (!row.metric_code) errors.push(`Row ${i + 1}: missing metric_code`);
      if (!row.value && row.value !== '0') errors.push(`Row ${i + 1}: missing value`);
      if (!row.period_start) errors.push(`Row ${i + 1}: missing period_start`);
      if (!row.period_end) errors.push(`Row ${i + 1}: missing period_end`);

      if (row.metric_code) {
        const def = getMetricByCode(row.metric_code);
        if (!def) errors.push(`Row ${i + 1}: unknown metric_code "${row.metric_code}"`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  transformToMetrics(raw: unknown): NormalizedMetricValue[] {
    const rows = raw as CsvRow[];
    return rows.map((row) => {
      const def = getMetricByCode(row.metric_code);
      const isNumeric = def?.isQuantitative ?? !isNaN(Number(row.value));

      return {
        metricCode: row.metric_code,
        periodStart: row.period_start,
        periodEnd: row.period_end,
        value: isNumeric
          ? { numeric: parseFloat(row.value) }
          : { text: row.value },
        unit: row.unit || def?.unit || undefined,
        confidenceLevel: (row.confidence_level as any) || 'estimated',
        sourceReference: 'csv_upload',
      };
    });
  }
}
