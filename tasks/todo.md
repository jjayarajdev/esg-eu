# Project Tasks

## Phase 0: Scaffolding

- [x] Create CLAUDE.md with workflow orchestration rules
- [x] Create tasks/lessons.md for self-correction tracking
- [x] Save workflow protocol to memory
- [x] Plan platform architecture
- [x] Initialize git repo and pnpm monorepo with Turborepo
- [x] Create full directory structure (14 workspace packages)
- [x] Set up shared-kernel package (tenant context, audit, events, errors, types)
- [x] Set up NestJS API shell (Swagger, middleware chain, health check)
- [x] Set up React web shell (Vite, routing, auth stub)
- [x] Set up Docker Compose (Postgres + Redis + MinIO)
- [x] Set up esrs-taxonomy package (12 standards, 80 disclosures, 109 metrics, 6 dept templates)
- [ ] Set up CI pipeline (GitHub Actions)

## Phase 1: Tenant + Data Collection

### Wave 1: Infrastructure — DONE
- [x] Database connection module (pg Pool, DatabaseService, TenantAwareService)
- [x] CLS setup (nestjs-cls for async tenant context)
- [x] Mock auth middleware (X-Tenant-Id / X-User-Email headers)
- [x] Auth guard + Roles guard + Roles decorator
- [x] In-memory event bus (EventEmitter2 implementing IEventBus)
- [x] Audit service (writes to tenant's audit_log table)

### Wave 2: Tenant Module — DONE
- [x] Tenant schema SQL (16 tables per tenant)
- [x] Schema provisioner (CREATE SCHEMA + run SQL + seed departments)
- [x] Tenant service (create, findById, update, delete/GDPR, list)
- [x] Tenant controller (POST/GET/PUT/DELETE endpoints)
- [x] Wire TenantModule into AppModule

### Wave 3: Data Collection Module — DONE
- [x] Reporting periods CRUD
- [x] Metric values CRUD (polymorphic values, status tracking)
- [x] Validation engine (against ESRSMetricDefinition.validationRules)
- [x] Variance auto-calculation (vs prior period)
- [ ] Evidence upload (presigned MinIO URLs) — deferred to Wave 5
- [x] Audit trail (every change logged)

### Wave 4: Approval Workflow Module — DONE
- [x] Generic workflow engine (any entity type)
- [x] Multi-step approval chain
- [x] Approve/reject with comments
- [x] Domain events (WorkflowCompleted, WorkflowRejected)

### Wave 5: Connector Module — DONE
- [x] IConnectorAdapter interface + NormalizedMetricValue
- [x] CSV upload adapter
- [x] Mock Enablon adapter (15 HSE&S metrics)
- [x] Mock SuccessFactors adapter (17 HR metrics)
- [x] Push ingestion endpoint + auto-upsert

### Wave 6-7: Wire + Frontend — DONE
- [x] All modules registered in AppModule
- [x] API client + mock auth provider (React)
- [x] Data collection page (metric grid + import buttons)
- [ ] Approval inbox page
- [ ] Connector management page

## Phase 2: Reporting + XBRL (future)
## Phase 3: DMA (future)
## Phase 4: AI Features (future)
## Phase 5: Taxonomy + SFDR (future)
