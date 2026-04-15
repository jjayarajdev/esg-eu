# EU ESG Platform

**ESRS Compliance Reporting SaaS** — A full-stack platform for EU Corporate Sustainability Reporting Directive (CSRD) compliance, built with Node.js, React, and PostgreSQL.

Covers the complete CSRD reporting pipeline: data collection from 11 enterprise source systems, Double Materiality Assessment, AI-powered narrative generation, ESRS report assembly, and iXBRL/ESEF export.

---

## Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- **Docker** (for PostgreSQL, Redis, MinIO)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/jjayarajdev/esg-eu.git
cd esg-eu
pnpm install

# 2. Start infrastructure (PostgreSQL on port 5433, Redis, MinIO)
docker compose up -d

# 3. Configure environment
cp .env.example apps/api/.env.local
# Edit apps/api/.env.local — set your OpenAI API key for AI features:
#   AI_PROVIDER=openai
#   OPENAI_API_KEY=sk-your-key-here

# 4. Seed ESRS reference data (12 standards, 109 metrics)
cd apps/api && npx ts-node src/infrastructure/seed.ts && cd ../..

# 5. Start the platform
pnpm --filter @esg/api dev &    # API on http://localhost:3000
pnpm --filter @esg/web dev &    # Frontend on http://localhost:5173
```

Open **http://localhost:5173** — the onboarding wizard will guide you through creating your first tenant.

### Stop Everything

```bash
# Stop dev servers
kill $(lsof -ti:3000) $(lsof -ti:5173)

# Stop Docker containers
docker compose down
```

---

## Application Flow

The platform guides users through 6 steps of CSRD compliance:

```
1. SETUP          Create tenant (company) + reporting period (e.g., FY 2024)
      ↓
2. COLLECT DATA   Import from 11 enterprise sources, upload CSV, or enter manually
      ↓
3. DMA            Score 10 ESRS topics on impact + financial materiality
      ↓
4. REPORT         Create ESRS report from material topics + collected data
      ↓
5. AI NARRATIVES  Generate qualitative disclosure text with GPT-4o-mini
      ↓
6. EXPORT iXBRL   Download ESEF-compliant iXBRL HTML for regulatory submission
```

A persistent workflow progress bar at the top of every page shows your position in this journey.

---

## What's Inside

### Modules

| Module | What it does |
|--------|-------------|
| **Tenant** | Multi-tenant isolation (schema-per-tenant in PostgreSQL), GDPR deletion |
| **Data Collection** | 109 ESRS metrics, inline editing, validation, variance tracking, audit trail |
| **Connectors** | 11 mock enterprise adapters with realistic API payloads + CSV upload |
| **DMA** | 10-topic scoring wizard, materiality matrix SVG visualization |
| **Approval Workflow** | Multi-step approve/reject with domain events |
| **AI** | OpenAI GPT-4o-mini: variance commentary, narrative synthesis, Copilot chat |
| **Reporting** | ESRS report assembly from DMA + data, AI-generated section narratives |
| **XBRL** | iXBRL/ESEF HTML generation with `<ix:nonFraction>` and `<ix:nonNumeric>` tags |
| **EU Taxonomy** | 4-step decision tree (eligibility → technical → DNSH → social safeguards) |
| **Supply Chain** | Supplier data portal — token-based, no auth required for suppliers |

### Connected Source Systems (Mock Adapters)

Each adapter simulates the real API format of its source system and includes full request/response documentation in the connector detail page.

| # | System | Domain | Metrics | API Format |
|---|--------|--------|---------|-----------|
| 1 | Enablon | HSE&S / Environmental | 15 | REST v1 |
| 2 | SAP SuccessFactors | HR / Workforce | 17 | OData v2 |
| 3 | SAP S/4HANA | ERP / Financial | 12 | OData v4 |
| 4 | EcoVadis | Procurement / Supply Chain | 7 | REST v1 |
| 5 | NAVEX EthicsPoint | Legal / Governance | 11 | REST v2 |
| 6 | Sphera | Product Safety / EHS | 11 | REST v1 |
| 7 | Workday | HR / People | 9 | REST (RAAS) |
| 8 | CDP | Climate Disclosure | 7 | REST v1 |
| 9 | Celonis | Process Mining | 7 | REST |
| 10 | Coupa | Procurement | 5 | REST |
| 11 | Power BI | Business Intelligence | 6 | REST (DAX) |
| | CSV Upload | Manual Import | Variable | File upload |

### ESRS Coverage

- **12 standards**: ESRS 1, ESRS 2 (mandatory), E1-E5 (environmental), S1-S4 (social), G1 (governance)
- **80 disclosure requirements** mapped to standards
- **109 metric definitions** with validation rules, GRI/ISSB cross-references, and XBRL tags
- **6 default departments** seeded per tenant (HSE&S 44%, HR 22%, Sustainability 15%, Procurement 13%, Legal 4%, PSRA 2%)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + NestJS + TypeScript |
| Frontend | React + Vite + Tailwind CSS |
| Database | PostgreSQL 16 (schema-per-tenant) |
| AI | OpenAI GPT-4o-mini (swappable to mock) |
| Auth | Mock provider (dev), designed for Clerk/Auth0 (prod) |
| Storage | MinIO / S3 (presigned URLs for evidence) |
| Monorepo | pnpm workspaces + Turborepo |

---

## Project Structure

```
esg-eu/
├── apps/
│   ├── api/                        # NestJS backend
│   │   └── src/
│   │       ├── infrastructure/     # Database, auth, audit, events, CLS
│   │       └── modules/            # Domain modules
│   │           ├── tenant/         # Multi-tenant management
│   │           ├── data-collection/# Metric values, evidence, periods
│   │           ├── connector/      # 11 source system adapters
│   │           ├── dma/            # Double Materiality Assessment
│   │           ├── approval-workflow/
│   │           ├── ai/             # OpenAI + mock providers
│   │           ├── reporting/      # ESRS report assembly
│   │           ├── xbrl/           # iXBRL generation
│   │           ├── taxonomy/       # EU Taxonomy decision trees
│   │           └── supply-chain/   # Supplier portal
│   └── web/                        # React frontend
│       └── src/
│           ├── components/         # Shared: charts, workflow bar, AI copilot
│           ├── features/           # Feature modules (mirrors backend)
│           ├── lib/                # API client
│           └── providers/          # Auth context
├── packages/
│   ├── shared-kernel/              # Types, errors, events, tenant context
│   ├── esrs-taxonomy/              # 109 metric definitions, 12 standards
│   └── shared-ui/                  # Design system (placeholder)
├── docs/
│   └── research/                   # Competitive analysis, UI/UX analysis
├── infrastructure/
│   └── docker/                     # Docker Compose, init SQL
└── tasks/                          # Todo, lessons learned
```

---

## Key URLs (Development)

| URL | What |
|-----|------|
| http://localhost:5173 | Frontend application |
| http://localhost:3000/api/docs | Swagger API documentation |
| http://localhost:3000/api/v1/health | Health check |
| http://localhost:9001 | MinIO console (minio / minio_dev) |

---

## Environment Variables

Copy `.env.example` to `apps/api/.env.local` and configure:

```bash
DATABASE_URL=postgresql://esg:esg_dev@localhost:5433/esg_platform
AI_PROVIDER=openai          # or 'mock' for development without API key
OPENAI_API_KEY=sk-your-key  # required if AI_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini    # or gpt-4o for higher quality
AUTH_PROVIDER=mock           # mock auth via X-Tenant-Id header
```

---

## Architecture Decisions

- **Modular monolith** — domain modules in `apps/api/src/modules/`, extractable to microservices
- **Schema-per-tenant** — each tenant gets a PostgreSQL schema (`tenant_{slug}`), CLS-based routing
- **Push-based connectors** — source systems push data via `/api/v1/ingest/:connectorType`
- **Provider abstraction** — AI, storage, queue, auth all swappable via env vars
- **Raw SQL via `pg`** — no ORM, direct PostgreSQL queries for schema routing flexibility
- **Mock-first development** — all 11 connectors and AI work without external credentials

---

## Development Notes

- **Docker Postgres runs on port 5433** (not 5432) to avoid conflict with local PostgreSQL
- **Domain modules live in `apps/api/src/modules/`** not in the top-level `modules/` directory
- **The supplier portal (`/portal/:token`)** is a standalone page — no sidebar, no auth required
- **Seed the shared schema** after first Docker startup: `cd apps/api && npx ts-node src/infrastructure/seed.ts`
- **To reset a tenant**: drop the schema and delete from `platform.tenants`, then recreate via the API

---

## Research

Two research reports are included in `docs/research/`:

- **ESG_Software_Competitive_Analysis_2026.md** — 14-platform competitive analysis (Workiva, IBM Envizi, Novisto, Persefoni, Watershed, SAP, Novata, Diligent, GovEVA, Sweep, Plan A, EQS Group, Envoria, AuditBoard)
- **Competitor_UI_UX_Analysis.md** — UI/UX patterns from 6 platforms with implementation recommendations

---

## License

Private — All rights reserved.
