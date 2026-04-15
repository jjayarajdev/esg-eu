# Project Tasks

## Phase 0: Scaffolding — COMPLETE
- [x] CLAUDE.md, lessons.md, memory, architecture plan
- [x] pnpm monorepo + Turborepo, directory structure
- [x] shared-kernel (tenant context, audit, events, errors, types, validation)
- [x] NestJS API shell (Swagger, middleware, health check, exception filter)
- [x] React web shell (Vite, routing)
- [x] Docker Compose (Postgres 16 on port 5433, Redis 7, MinIO)
- [x] esrs-taxonomy (12 standards, 80 disclosures, 109 metrics, 6 dept templates)
- [x] Seed script for shared schema reference data
- [x] CI pipeline (GitHub Actions — disabled for now, in git history)

## Phase 1: Tenant + Data Collection — COMPLETE
- [x] Database module (pg Pool, TenantAwareService with CLS schema routing)
- [x] Mock auth middleware (X-Tenant-Id header)
- [x] Event bus (EventEmitter2 + IEventBus interface)
- [x] Audit service (append-only logging)
- [x] Tenant module (schema provisioning, 16 tables, 6 dept seeds, GDPR delete)
- [x] Data collection (metric values CRUD, validation, variance calc, audit trail)
- [x] Reporting periods CRUD
- [x] Approval workflow (multi-step approve/reject, domain events, entity status update)
- [x] Connector module (adapter pattern, push ingestion, dedup fix)
- [x] Evidence upload API (MinIO presigned URLs)
- [x] Frontend: data grid, entry form, approval inbox, connectors page

## Phase 2: Reporting + XBRL — COMPLETE
- [x] Report service (create from DMA, section assembly, AI narrative generation)
- [x] Report controller (create, generate, finalize, HTML export)
- [x] XBRL module (iXBRL/ESEF HTML with ix:nonFraction + ix:nonNumeric tags)
- [x] Frontend: report list, section editor with AI generate buttons, iXBRL export

## Phase 3: DMA — COMPLETE
- [x] DMA service (create assessment, auto-populate 10 topics, scoring, finalize, materiality threshold)
- [x] DMA controller (CRUD, score topics, finalize, matrix, material-topics)
- [x] Frontend: DMA list with topic pills, scoring wizard with sliders, materiality matrix SVG

## Phase 4: AI Features — COMPLETE
- [x] AI service with provider abstraction (OpenAI + Mock)
- [x] Variance commentary endpoint
- [x] Narrative synthesis endpoint
- [x] AI Copilot chat endpoint + floating chat widget
- [x] ESG-tuned system prompts, token usage tracking

## Mock Connectors — COMPLETE (11 sources)
- [x] Enablon (15 HSE&S metrics, REST API format)
- [x] SAP SuccessFactors (17 HR metrics, OData v2 format)
- [x] SAP S/4HANA (12 ERP/financial metrics, OData v4 format)
- [x] EcoVadis (7 procurement metrics, REST scorecard format)
- [x] EthicsPoint (11 governance metrics, REST case management format)
- [x] Sphera (11 product safety metrics, REST compliance format)
- [x] Workday (9 HR metrics, RAAS report format)
- [x] CDP (7 climate metrics, response API format)
- [x] Celonis (7 process mining metrics, analysis export format)
- [x] Coupa (5 procurement metrics, spend management format)
- [x] Power BI (6 BI metrics, DAX query result format)
- [x] CSV Upload (generic file import with drag-and-drop)

## UI/UX Enhancements — COMPLETE
- [x] Tailwind CSS design system with dark sidebar navigation
- [x] Guided onboarding wizard (4-step: company → CSRD wave → period)
- [x] Persistent workflow progress bar (6-step CSRD journey)
- [x] Dashboard with charts: emissions donut, status bars, taxonomy alignment, ESRS heatmap, sources donut
- [x] Inline editable data grid (click to edit values)
- [x] Framework cross-mapping badges (GRI, ISSB per metric)
- [x] Source system payload tooltips (hover to see API format)
- [x] Calculation transparency modal (provenance, data quality, audit timeline)
- [x] AI Copilot chat widget (floating button, ESG Q&A)
- [x] Connector detail page (API docs, req/resp, field mapping, mock/live toggle)
- [x] Setup page (tenant creation, reporting period management, flow guide)
- [x] All pages redesigned: DMA, Approvals, Connectors, Reports

## Research — COMPLETE
- [x] Competitive analysis (14 platforms, 1,295 lines)
- [x] UI/UX competitor analysis (6 platforms, patterns to steal)

## Pending (future)
- [ ] Phase 5: EU Taxonomy module (decision trees, DNSH, social safeguards)
- [ ] Phase 5: SFDR module (PAI indicators, Article 6/8/9)
- [ ] Real auth (Clerk/Auth0 replacing mock headers)
- [ ] Evidence upload UI (backend done, frontend file picker needed)
- [ ] Tests (unit, integration, e2e)
- [ ] AWS CDK deployment
- [ ] Helm charts for on-prem
- [ ] Multi-language (i18n: DE, FR, ES, IT, NL)
- [ ] Notifications (deadlines, approval requests, data gaps)
- [ ] Peer benchmarking
- [ ] Target setting & tracking
- [ ] 92 EFRAG sub-topics in DMA
- [ ] Dark mode
