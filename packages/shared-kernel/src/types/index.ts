// Shared domain types used across module boundaries

/** ESRS topical standard codes */
export type ESRSTopicCode =
  | 'ESRS_1'
  | 'ESRS_2'
  | 'E1'
  | 'E2'
  | 'E3'
  | 'E4'
  | 'E5'
  | 'S1'
  | 'S2'
  | 'S3'
  | 'S4'
  | 'G1';

/** ESRS standard categories */
export type ESRSCategory =
  | 'cross_cutting'
  | 'environmental'
  | 'social'
  | 'governance';

/** Reporting period types */
export type PeriodType = 'annual' | 'quarterly' | 'semi_annual';

/** Data types for metric definitions */
export type MetricDataType =
  | 'numeric'
  | 'percentage'
  | 'boolean'
  | 'text'
  | 'enum'
  | 'date';

/** Aggregation methods for metrics */
export type AggregationMethod =
  | 'sum'
  | 'average'
  | 'weighted_avg'
  | 'latest';

/** Approval status for data points, reports, DMA assessments */
export type ApprovalStatus =
  | 'draft'
  | 'submitted'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'published';

/** User roles within a tenant */
export type UserRole =
  | 'admin'
  | 'data_owner'
  | 'approver'
  | 'auditor'
  | 'viewer';

/** Subscription tiers */
export type SubscriptionTier =
  | 'vsme_starter'
  | 'esrs_core'
  | 'esrs_professional'
  | 'esrs_enterprise';

/** CSRD reporting waves */
export type CSRDWave = 1 | 2 | 3 | 4;

/** Company size classification */
export type CompanySize = 'sme' | 'large' | 'pie';

/** Connector authentication types */
export type ConnectorAuthType =
  | 'api_key'
  | 'oauth2'
  | 'webhook_secret'
  | 'mtls';

/** Connector categories */
export type ConnectorCategory =
  | 'sap'
  | 'reporting_tool'
  | 'external_provider'
  | 'custom';

/** Paginated response wrapper */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

/** Standard API error response */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; issue: string }>;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}
