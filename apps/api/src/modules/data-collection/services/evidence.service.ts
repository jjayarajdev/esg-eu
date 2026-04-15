import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import { AuditService } from '../../../infrastructure/audit/audit.service';

export interface EvidenceRow {
  id: string;
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_key: string;
  created_at: Date;
}

@Injectable()
export class EvidenceService {
  private s3: S3Client;
  private bucket: string;

  constructor(
    private readonly db: TenantAwareService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {
    const endpoint = config.get('MINIO_ENDPOINT', 'http://localhost:9000');
    this.bucket = config.get('STORAGE_BUCKET', 'esg-platform');

    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get('MINIO_ACCESS_KEY', 'minio'),
        secretAccessKey: config.get('MINIO_SECRET_KEY', 'minio_dev'),
      },
    });
  }

  /** Get a presigned URL for uploading a file */
  async getUploadUrl(params: {
    entityType: string;
    entityId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }): Promise<{ uploadUrl: string; storageKey: string }> {
    const ctx = this.db.tenantContext;
    const storageKey = `tenants/${ctx.tenantId}/${params.entityType}/${params.entityId}/${Date.now()}_${params.fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: params.mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });

    // Record the evidence document
    const result = await this.db.query(
      `INSERT INTO evidence_documents (entity_type, entity_id, file_name, file_size, mime_type, storage_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [params.entityType, params.entityId, params.fileName, params.fileSize, params.mimeType, storageKey],
    );

    await this.audit.log({
      action: 'created',
      entityType: 'evidence_document',
      entityId: result.rows[0].id,
      changes: { fileName: params.fileName, entityType: params.entityType, entityId: params.entityId },
    });

    return { uploadUrl, storageKey };
  }

  /** Get a presigned URL for downloading a file */
  async getDownloadUrl(evidenceId: string): Promise<{ downloadUrl: string; fileName: string }> {
    const result = await this.db.query(
      'SELECT * FROM evidence_documents WHERE id = $1',
      [evidenceId],
    );
    if (result.rows.length === 0) throw new Error('Evidence not found');

    const doc = result.rows[0] as EvidenceRow;
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: doc.storage_key,
    });

    const downloadUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return { downloadUrl, fileName: doc.file_name };
  }

  /** List evidence documents for an entity */
  async listByEntity(entityType: string, entityId: string): Promise<EvidenceRow[]> {
    const result = await this.db.query(
      'SELECT * FROM evidence_documents WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC',
      [entityType, entityId],
    );
    return result.rows as EvidenceRow[];
  }
}
