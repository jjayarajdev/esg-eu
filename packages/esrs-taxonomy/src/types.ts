/**
 * Type definitions for the ESRS taxonomy package.
 * These types define the structure of ESRS standards,
 * disclosure requirements, and metric definitions.
 */

export interface ESRSStandard {
  /** Unique code: 'ESRS_1', 'ESRS_2', 'E1', 'E2', ..., 'G1' */
  code: string;
  /** Full name of the standard */
  name: string;
  /** Category grouping */
  category: 'cross_cutting' | 'environmental' | 'social' | 'governance';
  /** Whether this standard is mandatory for all CSRD companies */
  isMandatory: boolean;
  /** Brief description */
  description: string;
  /** ESRS version identifier */
  version: string;
  /** Date from which this version is effective */
  effectiveFrom: string;
  /** Display sort order */
  sortOrder: number;
}

export interface ESRSDisclosureRequirement {
  /** Unique code: 'E1-1', 'E1-6', 'S1-9', 'GOV-1', etc. */
  code: string;
  /** Code of the parent standard */
  standardCode: string;
  /** Full name of the disclosure requirement */
  name: string;
  /** Pillar (for ESRS 2 cross-cutting only): 'GOV', 'SBM', 'IRO', 'MDR' */
  pillar: string | null;
  /** Whether this disclosure is mandatory regardless of materiality */
  isMandatory: boolean;
  /** Brief description */
  description: string;
  /** ESRS version */
  version: string;
  /** Display sort order */
  sortOrder: number;
}

export type MetricDataType =
  | 'numeric'
  | 'percentage'
  | 'boolean'
  | 'text'
  | 'enum'
  | 'date';

export type AggregationMethod =
  | 'sum'
  | 'average'
  | 'weighted_avg'
  | 'latest';

export interface ESRSMetricDefinition {
  /** Unique code: 'E1_GHG_SCOPE1_TOTAL', 'S1_HEADCOUNT_FTE', etc. */
  code: string;
  /** Code of the parent disclosure requirement */
  disclosureReqCode: string;
  /** Code of the parent standard */
  standardCode: string;
  /** Human-readable name */
  name: string;
  /** Detailed description */
  description: string;
  /** Data type */
  dataType: MetricDataType;
  /** Unit of measurement (null for text/boolean) */
  unit: string | null;
  /** True = quantitative KPI, False = qualitative narrative */
  isQuantitative: boolean;
  /** How often this metric is reported */
  reportingFrequency: 'annual' | 'quarterly' | 'semi_annual';
  /** How values are aggregated across entities/periods */
  aggregationMethod: AggregationMethod | null;
  /** Validation rules for data entry */
  validationRules: {
    min?: number;
    max?: number;
    required?: boolean;
    precision?: number;
  } | null;
  /** Allowed values for enum types */
  enumValues: string[] | null;
  /** Searchable tags */
  tags: string[];
  /** GRI standard cross-reference */
  griMapping: string | null;
  /** ISSB/IFRS cross-reference */
  issbMapping: string | null;
  /** XBRL taxonomy tag */
  xbrlTag: string | null;
  /** ESRS version */
  version: string;
  /** Date from which this definition is effective */
  effectiveFrom: string;
  /** Display sort order */
  sortOrder: number;
}

export interface DepartmentTemplate {
  /** Department name */
  name: string;
  /** Short code */
  code: string;
  /** Description */
  description: string;
  /** Default % of KPIs this department owns */
  defaultKpiPct: number;
  /** ESRS standard codes this department typically owns */
  defaultStandards: string[];
  /** Sort order */
  sortOrder: number;
}
