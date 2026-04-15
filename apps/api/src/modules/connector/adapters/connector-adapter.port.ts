/**
 * The universal metric payload that ALL adapters must produce.
 * No matter what shape the source system data arrives in,
 * the adapter transforms it to an array of these.
 */
export interface NormalizedMetricValue {
  /** ESRS metric code, e.g., 'E1_6_GHG_SCOPE1' */
  metricCode: string;
  /** ISO date for period start */
  periodStart: string;
  /** ISO date for period end */
  periodEnd: string;
  /** The actual value */
  value: {
    numeric?: number;
    text?: string;
    boolean?: boolean;
  };
  /** Unit of measurement */
  unit?: string;
  /** Data quality indicator */
  confidenceLevel?: 'measured' | 'estimated' | 'calculated';
  /** Source system reference */
  sourceReference?: string;
}

export interface AdapterValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Interface that every connector adapter must implement.
 * CSV adapter, mock adapters, and real system adapters all conform to this.
 */
export interface IConnectorAdapter {
  /** Unique connector type identifier */
  readonly connectorType: string;

  /** Display name for the UI */
  readonly displayName: string;

  /** Validate the raw payload before processing */
  validatePayload(raw: unknown): AdapterValidationResult;

  /** Transform raw payload into normalized metric values */
  transformToMetrics(raw: unknown): NormalizedMetricValue[];
}
