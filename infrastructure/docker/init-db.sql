-- ============================================================
-- EU ESG Platform — Initial Database Setup
-- Creates the shared and platform schemas with reference tables.
-- Runs automatically on first postgres container start.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SCHEMA: shared — Read-only ESRS reference data
-- ============================================================
CREATE SCHEMA IF NOT EXISTS shared;

-- ESRS Standard definitions (E1-E5, S1-S4, G1, ESRS 1, ESRS 2)
CREATE TABLE shared.esrs_standards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(10) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    category        VARCHAR(20) NOT NULL,
    is_mandatory    BOOLEAN NOT NULL DEFAULT false,
    description     TEXT,
    version         VARCHAR(20) NOT NULL,
    effective_from  DATE NOT NULL,
    superseded_by   UUID REFERENCES shared.esrs_standards(id),
    sort_order      SMALLINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ESRS Disclosure Requirements (sub-sections within standards)
CREATE TABLE shared.esrs_disclosure_requirements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_id     UUID NOT NULL REFERENCES shared.esrs_standards(id),
    code            VARCHAR(30) NOT NULL UNIQUE,
    name            VARCHAR(300) NOT NULL,
    pillar          VARCHAR(20),
    is_mandatory    BOOLEAN NOT NULL DEFAULT false,
    description     TEXT,
    version         VARCHAR(20) NOT NULL,
    sort_order      SMALLINT NOT NULL
);

-- The 167 metric definitions (core of the platform)
CREATE TABLE shared.esrs_metric_definitions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(50) NOT NULL UNIQUE,
    disclosure_req_id   UUID NOT NULL REFERENCES shared.esrs_disclosure_requirements(id),
    standard_id         UUID NOT NULL REFERENCES shared.esrs_standards(id),
    name                VARCHAR(500) NOT NULL,
    description         TEXT,
    data_type           VARCHAR(20) NOT NULL,
    unit                VARCHAR(50),
    is_quantitative     BOOLEAN NOT NULL,
    reporting_frequency VARCHAR(20) NOT NULL DEFAULT 'annual',
    aggregation_method  VARCHAR(20),
    validation_rules    JSONB,
    enum_values         JSONB,
    tags                TEXT[],
    gri_mapping         VARCHAR(50),
    issb_mapping        VARCHAR(50),
    xbrl_tag            VARCHAR(200),
    version             VARCHAR(20) NOT NULL,
    effective_from      DATE NOT NULL,
    superseded_by       UUID REFERENCES shared.esrs_metric_definitions(id),
    sort_order          SMALLINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_metric_def_standard ON shared.esrs_metric_definitions(standard_id);
CREATE INDEX idx_metric_def_disclosure ON shared.esrs_metric_definitions(disclosure_req_id);
CREATE INDEX idx_metric_def_quantitative ON shared.esrs_metric_definitions(is_quantitative);

-- EU Taxonomy activities
CREATE TABLE shared.taxonomy_activities (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nace_code               VARCHAR(20) NOT NULL,
    activity_name           VARCHAR(500) NOT NULL,
    environmental_objective VARCHAR(50) NOT NULL,
    description             TEXT,
    is_enabling             BOOLEAN NOT NULL DEFAULT false,
    is_transitional         BOOLEAN NOT NULL DEFAULT false,
    technical_criteria      JSONB NOT NULL,
    dnsh_criteria           JSONB NOT NULL,
    version                 VARCHAR(20) NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Department templates (default structure for new tenants)
CREATE TABLE shared.department_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(30) NOT NULL UNIQUE,
    description     TEXT,
    default_kpi_pct NUMERIC(5,2),
    sort_order      SMALLINT NOT NULL
);

-- Department-to-standard default mapping
CREATE TABLE shared.department_standard_mapping (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_template_id  UUID NOT NULL REFERENCES shared.department_templates(id),
    standard_id             UUID NOT NULL REFERENCES shared.esrs_standards(id),
    UNIQUE(department_template_id, standard_id)
);

-- ============================================================
-- SCHEMA: platform — Cross-tenant operations
-- ============================================================
CREATE SCHEMA IF NOT EXISTS platform;

-- Tenant registry
CREATE TABLE platform.tenants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(100) NOT NULL UNIQUE,
    schema_name         VARCHAR(120) GENERATED ALWAYS AS ('tenant_' || slug) STORED,
    subscription_tier   VARCHAR(30) NOT NULL DEFAULT 'esrs_core',
    company_size        VARCHAR(20),
    csrd_wave           SMALLINT,
    country_code        CHAR(2),
    industry_sector     VARCHAR(100),
    employee_count      INTEGER,
    settings            JSONB NOT NULL DEFAULT '{}',
    is_active           BOOLEAN NOT NULL DEFAULT true,
    schema_version      INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Connector registry (available connector types)
CREATE TABLE platform.connector_registry (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_type  VARCHAR(50) NOT NULL UNIQUE,
    display_name    VARCHAR(200) NOT NULL,
    category        VARCHAR(30) NOT NULL,
    description     TEXT,
    config_schema   JSONB NOT NULL,
    supported_metrics TEXT[] NOT NULL,
    auth_type       VARCHAR(30) NOT NULL,
    is_mock         BOOLEAN NOT NULL DEFAULT false,
    version         VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Platform-level audit log (admin operations)
CREATE TABLE platform.platform_audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type      VARCHAR(20) NOT NULL,
    actor_id        VARCHAR(200),
    tenant_id       UUID REFERENCES platform.tenants(id),
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(100),
    resource_id     VARCHAR(200),
    details         JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_audit_tenant ON platform.platform_audit_log(tenant_id, created_at DESC);

-- ============================================================
-- Grant permissions
-- ============================================================
GRANT USAGE ON SCHEMA shared TO esg;
GRANT SELECT ON ALL TABLES IN SCHEMA shared TO esg;
GRANT USAGE ON SCHEMA platform TO esg;
GRANT ALL ON ALL TABLES IN SCHEMA platform TO esg;
GRANT ALL ON ALL SEQUENCES IN SCHEMA platform TO esg;
