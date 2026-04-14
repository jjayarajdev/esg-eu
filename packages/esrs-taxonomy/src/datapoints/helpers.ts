import type { ESRSMetricDefinition } from '../types';
import { ESRS_METRIC_DEFINITIONS } from './metrics';

/** Get all metrics belonging to a specific ESRS standard */
export function getMetricsByStandard(standardCode: string): ESRSMetricDefinition[] {
  return ESRS_METRIC_DEFINITIONS.filter((m) => m.standardCode === standardCode);
}

/** Get a single metric by its unique code */
export function getMetricByCode(code: string): ESRSMetricDefinition | undefined {
  return ESRS_METRIC_DEFINITIONS.find((m) => m.code === code);
}

/** Get all quantitative metrics (KPIs with numeric values) */
export function getQuantitativeMetrics(): ESRSMetricDefinition[] {
  return ESRS_METRIC_DEFINITIONS.filter((m) => m.isQuantitative);
}

/** Get all qualitative metrics (narrative/text disclosures) */
export function getQualitativeMetrics(): ESRSMetricDefinition[] {
  return ESRS_METRIC_DEFINITIONS.filter((m) => !m.isQuantitative);
}

/** Get all metrics belonging to a specific disclosure requirement */
export function getMetricsByDisclosure(disclosureCode: string): ESRSMetricDefinition[] {
  return ESRS_METRIC_DEFINITIONS.filter((m) => m.disclosureReqCode === disclosureCode);
}
