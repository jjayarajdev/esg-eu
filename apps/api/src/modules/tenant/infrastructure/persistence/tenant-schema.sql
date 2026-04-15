-- ============================================================
-- Tenant Schema Migration v1
-- Runs inside each tenant_{slug} schema.
-- search_path: tenant_{slug}, shared, public
-- ============================================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id     VARCHAR(200),
    email           VARCHAR(320) NOT NULL UNIQUE,
    display_name    VARCHAR(200) NOT NULL,
    roles           TEXT[] NOT NULL DEFAULT ARRAY['viewer'],
    department_id   UUID,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      UUID,
    updated_by      UUID
);

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(30) NOT NULL UNIQUE,
    description     TEXT,
    head_user_id    UUID REFERENCES users(id),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    sort_order      SMALLINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD CONSTRAINT fk_users_department
    FOREIGN KEY (department_id) REFERENCES departments(id);

-- DEPARTMENT-STANDARD ASSIGNMENTS
CREATE TABLE IF NOT EXISTS department_standard_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    standard_id     UUID NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(department_id, standard_id)
);

-- DEPARTMENT-METRIC ASSIGNMENTS
CREATE TABLE IF NOT EXISTS department_metric_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    metric_def_id   UUID NOT NULL,
    is_primary_owner BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(department_id, metric_def_id)
);

-- CONNECTOR CONFIGURATIONS
CREATE TABLE IF NOT EXISTS connector_configurations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_type  VARCHAR(50) NOT NULL,
    display_name    VARCHAR(200) NOT NULL,
    is_enabled      BOOLEAN NOT NULL DEFAULT true,
    auth_config     JSONB NOT NULL DEFAULT '{}',
    schedule_cron   VARCHAR(100),
    last_sync_at    TIMESTAMPTZ,
    last_sync_status VARCHAR(20),
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

-- CONNECTOR METRIC MAPPINGS
CREATE TABLE IF NOT EXISTS connector_metric_mappings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_config_id UUID NOT NULL REFERENCES connector_configurations(id) ON DELETE CASCADE,
    metric_def_id       UUID NOT NULL,
    source_field        VARCHAR(200) NOT NULL,
    transform_expr      TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(connector_config_id, metric_def_id)
);

-- REPORTING PERIODS
CREATE TABLE IF NOT EXISTS reporting_periods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    period_type     VARCHAR(20) NOT NULL DEFAULT 'annual',
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    is_locked       BOOLEAN NOT NULL DEFAULT false,
    is_current      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      UUID REFERENCES users(id),
    CONSTRAINT chk_period_dates CHECK (end_date > start_date),
    CONSTRAINT uq_period_dates UNIQUE (start_date, end_date)
);

-- METRIC VALUES
CREATE TABLE IF NOT EXISTS metric_values (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_def_id       VARCHAR(50) NOT NULL,
    reporting_period_id UUID NOT NULL REFERENCES reporting_periods(id),
    department_id       UUID REFERENCES departments(id),
    numeric_value       NUMERIC(20,6),
    text_value          TEXT,
    boolean_value       BOOLEAN,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',
    confidence_level    VARCHAR(20),
    data_source         VARCHAR(200),
    prior_period_value  NUMERIC(20,6),
    variance_pct        NUMERIC(10,4),
    variance_explanation TEXT,
    source_connector_id UUID REFERENCES connector_configurations(id),
    source_ingestion_id UUID,
    version             INTEGER NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id),
    CONSTRAINT uq_metric_period_dept UNIQUE (metric_def_id, reporting_period_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_mv_period ON metric_values(reporting_period_id);
CREATE INDEX IF NOT EXISTS idx_mv_status ON metric_values(status);
CREATE INDEX IF NOT EXISTS idx_mv_metric_def ON metric_values(metric_def_id);

-- DATA INGESTION LOG
CREATE TABLE IF NOT EXISTS data_ingestion_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_config_id UUID NOT NULL REFERENCES connector_configurations(id),
    connector_type      VARCHAR(50) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    records_received    INTEGER NOT NULL DEFAULT 0,
    records_accepted    INTEGER NOT NULL DEFAULT 0,
    records_rejected    INTEGER NOT NULL DEFAULT 0,
    error_details       JSONB,
    started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at        TIMESTAMPTZ
);

-- DMA ASSESSMENTS (Phase 3 stub)
CREATE TABLE IF NOT EXISTS dma_assessments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_period_id UUID NOT NULL REFERENCES reporting_periods(id),
    name                VARCHAR(200) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',
    methodology         JSONB,
    finalized_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id)
);

-- DMA TOPIC SCORES (Phase 3 stub)
CREATE TABLE IF NOT EXISTS dma_topic_scores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID NOT NULL REFERENCES dma_assessments(id) ON DELETE CASCADE,
    standard_id     UUID NOT NULL,
    impact_score    NUMERIC(5,2),
    financial_score NUMERIC(5,2),
    is_material     BOOLEAN,
    justification   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(assessment_id, standard_id)
);

-- APPROVAL WORKFLOWS
CREATE TABLE IF NOT EXISTS approval_workflows (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           UUID NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    current_step_order  INTEGER NOT NULL DEFAULT 1,
    total_steps         INTEGER NOT NULL,
    initiated_by        UUID REFERENCES users(id),
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_entity ON approval_workflows(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status ON approval_workflows(status);

-- APPROVAL STEPS
CREATE TABLE IF NOT EXISTS approval_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id     UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
    step_order      INTEGER NOT NULL,
    step_name       VARCHAR(100) NOT NULL,
    required_role   VARCHAR(30) NOT NULL,
    assigned_to     UUID REFERENCES users(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    decision        VARCHAR(20),
    comments        TEXT,
    decided_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workflow_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_step_assigned ON approval_steps(assigned_to, status);

-- REPORTS (Phase 2 stub)
CREATE TABLE IF NOT EXISTS reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_period_id UUID NOT NULL REFERENCES reporting_periods(id),
    report_type         VARCHAR(50) NOT NULL DEFAULT 'esrs_annual',
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',
    generated_at        TIMESTAMPTZ,
    file_url            TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id)
);

-- EVIDENCE DOCUMENTS
CREATE TABLE IF NOT EXISTS evidence_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID NOT NULL,
    file_name       VARCHAR(500) NOT NULL,
    file_size       BIGINT NOT NULL,
    mime_type       VARCHAR(200) NOT NULL,
    storage_key     VARCHAR(1000) NOT NULL,
    checksum_sha256 VARCHAR(64),
    uploaded_by     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_entity ON evidence_documents(entity_type, entity_id);

-- AI REQUESTS (token tracking)
CREATE TABLE IF NOT EXISTS ai_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type        VARCHAR(50) NOT NULL,
    model               VARCHAR(50),
    prompt_tokens       INTEGER,
    completion_tokens   INTEGER,
    total_tokens        INTEGER,
    input_context       JSONB,
    output_text         TEXT,
    duration_ms         INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AUDIT LOG (append-only)
CREATE TABLE IF NOT EXISTS audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID,
    changes         JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, created_at DESC);

-- EU TAXONOMY ASSESSMENTS
CREATE TABLE IF NOT EXISTS taxonomy_assessments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_period_id UUID NOT NULL REFERENCES reporting_periods(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',
    turnover_aligned_pct NUMERIC(5,2),
    capex_aligned_pct   NUMERIC(5,2),
    opex_aligned_pct    NUMERIC(5,2),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS taxonomy_activity_screenings (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL REFERENCES taxonomy_assessments(id) ON DELETE CASCADE,
    nace_code               VARCHAR(20) NOT NULL,
    activity_name           VARCHAR(500) NOT NULL,
    environmental_objective VARCHAR(50) NOT NULL DEFAULT 'climate_mitigation',
    turnover_eur            NUMERIC(20,2),
    capex_eur               NUMERIC(20,2),
    opex_eur                NUMERIC(20,2),
    step_eligibility        BOOLEAN,
    step_technical          JSONB,
    step_dnsh               JSONB,
    step_social             BOOLEAN,
    is_aligned              BOOLEAN,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(assessment_id, nace_code)
);

-- SUPPLY CHAIN CAMPAIGNS
CREATE TABLE IF NOT EXISTS supply_chain_campaigns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    deadline            DATE,
    metrics_requested   TEXT[] NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supply_chain_invites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID NOT NULL REFERENCES supply_chain_campaigns(id) ON DELETE CASCADE,
    supplier_name   VARCHAR(200) NOT NULL,
    supplier_email  VARCHAR(320) NOT NULL,
    access_token    VARCHAR(100) NOT NULL UNIQUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    submitted_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supply_chain_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_id       UUID NOT NULL REFERENCES supply_chain_invites(id) ON DELETE CASCADE,
    metric_code     VARCHAR(50) NOT NULL,
    numeric_value   NUMERIC(20,6),
    text_value      TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
