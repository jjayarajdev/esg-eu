// @esg/esrs-taxonomy — Public API

// Type definitions
export type {
  ESRSStandard,
  ESRSDisclosureRequirement,
  ESRSMetricDefinition,
  DepartmentTemplate,
  MetricDataType,
  AggregationMethod,
} from './types';

// ESRS Standards (12 standards)
export { ESRS_STANDARDS } from './standards';

// Disclosure Requirements (80 requirements across all standards)
export { ESRS_DISCLOSURE_REQUIREMENTS } from './standards';

// Department Templates (6 default departments)
export { DEPARTMENT_TEMPLATES } from './standards';

// Metric Definitions (~100+ metrics)
export { ESRS_METRIC_DEFINITIONS } from './datapoints';

// Helper functions for querying metrics
export {
  getMetricsByStandard,
  getMetricByCode,
  getQuantitativeMetrics,
  getQualitativeMetrics,
  getMetricsByDisclosure,
} from './datapoints';
