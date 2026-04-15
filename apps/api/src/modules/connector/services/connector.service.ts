import { Injectable } from '@nestjs/common';
import { NotFoundError, ValidationError } from '@esg/shared-kernel';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import { AuditService } from '../../../infrastructure/audit/audit.service';
import type { IConnectorAdapter, NormalizedMetricValue } from '../adapters/connector-adapter.port';
import { CsvUploadAdapter } from '../adapters/csv-upload.adapter';
import { MockEnablonAdapter } from '../adapters/mock-enablon.adapter';
import { MockSuccessFactorsAdapter } from '../adapters/mock-successfactors.adapter';
import { MockEcoVadisAdapter } from '../adapters/mock-ecovadis.adapter';
import { MockEthicsPointAdapter } from '../adapters/mock-ethicspoint.adapter';
import { MockSpheraAdapter } from '../adapters/mock-sphera.adapter';

@Injectable()
export class ConnectorService {
  private adapters: Map<string, IConnectorAdapter>;

  constructor(
    private readonly db: TenantAwareService,
    private readonly audit: AuditService,
  ) {
    // Register available adapters
    this.adapters = new Map();
    const adapterList: IConnectorAdapter[] = [
      new CsvUploadAdapter(),
      new MockEnablonAdapter(),
      new MockSuccessFactorsAdapter(),
      new MockEcoVadisAdapter(),
      new MockEthicsPointAdapter(),
      new MockSpheraAdapter(),
    ];
    for (const adapter of adapterList) {
      this.adapters.set(adapter.connectorType, adapter);
    }
  }

  /** List available connector types */
  getAvailableAdapters(): Array<{ connectorType: string; displayName: string }> {
    return Array.from(this.adapters.values()).map((a) => ({
      connectorType: a.connectorType,
      displayName: a.displayName,
    }));
  }

  /**
   * Ingest data from a source system.
   * Validates payload, transforms to normalized metrics, stores in metric_values.
   */
  async ingest(
    connectorType: string,
    reportingPeriodId: string,
    payload: unknown,
  ): Promise<{ accepted: number; rejected: number; errors: string[] }> {
    const adapter = this.adapters.get(connectorType);
    if (!adapter) {
      throw new NotFoundError(
        `Unknown connector type: ${connectorType}. Available: ${Array.from(this.adapters.keys()).join(', ')}`,
      );
    }

    // Validate payload
    const validation = adapter.validatePayload(payload);
    if (!validation.valid) {
      throw new ValidationError(
        `Payload validation failed: ${validation.errors.join('; ')}`,
      );
    }

    // Transform to normalized metrics
    const metrics = adapter.transformToMetrics(payload);

    // Ensure a connector config exists (auto-create for mock connectors)
    let configResult = await this.db.query(
      'SELECT id FROM connector_configurations WHERE connector_type = $1 LIMIT 1',
      [connectorType],
    );
    if (configResult.rows.length === 0) {
      configResult = await this.db.query(
        `INSERT INTO connector_configurations (connector_type, display_name)
         VALUES ($1, $2) RETURNING id`,
        [connectorType, adapter.displayName],
      );
    }
    const configId = configResult.rows[0].id;

    // Log the ingestion run
    const runResult = await this.db.query(
      `INSERT INTO data_ingestion_log (connector_config_id, connector_type, status, records_received)
       VALUES ($1, $2, 'processing', $3)
       RETURNING id`,
      [configId, connectorType, metrics.length],
    );
    const runId = runResult.rows[0].id;

    // Store each metric value
    let accepted = 0;
    let rejected = 0;
    const errors: string[] = [];

    for (const metric of metrics) {
      try {
        await this.storeMetricValue(metric, reportingPeriodId, connectorType, runId);
        accepted++;
      } catch (err: any) {
        rejected++;
        errors.push(`${metric.metricCode}: ${err.message}`);
      }
    }

    // Update ingestion run status
    await this.db.query(
      `UPDATE data_ingestion_log
       SET status = $1, records_accepted = $2, records_rejected = $3,
           error_details = $4, completed_at = now()
       WHERE id = $5`,
      [
        rejected === 0 ? 'completed' : 'partial',
        accepted,
        rejected,
        errors.length > 0 ? JSON.stringify(errors) : null,
        runId,
      ],
    );

    await this.audit.log({
      action: 'connector_synced',
      entityType: 'connector',
      entityId: runId,
      changes: { connectorType, accepted, rejected },
    });

    return { accepted, rejected, errors };
  }

  /** Get ingestion run history for a connector type */
  async getRunHistory(connectorType?: string): Promise<any[]> {
    const conditions = connectorType ? 'WHERE connector_type = $1' : '';
    const params = connectorType ? [connectorType] : [];
    const result = await this.db.query(
      `SELECT * FROM data_ingestion_log ${conditions} ORDER BY started_at DESC LIMIT 50`,
      params,
    );
    return result.rows;
  }

  private async storeMetricValue(
    metric: NormalizedMetricValue,
    reportingPeriodId: string,
    connectorType: string,
    ingestionRunId: string,
  ): Promise<void> {
    // Upsert: if metric+period already exists, update; otherwise insert
    await this.db.query(
      `INSERT INTO metric_values
       (metric_def_id, reporting_period_id, numeric_value, text_value, boolean_value,
        status, confidence_level, data_source, source_ingestion_id)
       VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8)
       ON CONFLICT (metric_def_id, reporting_period_id, department_id)
       DO UPDATE SET
         numeric_value = EXCLUDED.numeric_value,
         text_value = EXCLUDED.text_value,
         boolean_value = EXCLUDED.boolean_value,
         confidence_level = EXCLUDED.confidence_level,
         data_source = EXCLUDED.data_source,
         source_ingestion_id = EXCLUDED.source_ingestion_id,
         version = metric_values.version + 1,
         updated_at = now()`,
      [
        metric.metricCode,
        reportingPeriodId,
        metric.value.numeric ?? null,
        metric.value.text ?? null,
        metric.value.boolean ?? null,
        metric.confidenceLevel || null,
        connectorType,
        ingestionRunId,
      ],
    );
  }
}
