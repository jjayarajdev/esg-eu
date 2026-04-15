# ESG Platform UI/UX Competitive Analysis
**April 2026 | Based on public demos, product pages, and marketing materials**

---

## Key UI Patterns Across Top Platforms

### 1. Sweep (sweep.net) — Best CSRD Workflow UX
**Design Language:** Clean white + green accent. Professional, airy.
**Standout Features:**
- **6-step linear CSRD workflow** visible at all times: Materiality Assessment → Gap Analysis → Data Collection → Validation → Internal Controls → Report Submission
- **Materiality Matrix Builder** — interactive visual matrix for plotting double materiality, exportable as PNG/Excel
- **Campaign Progress Dashboard** — real-time tracking of data collection across departments
- **Validation workflow with comments** — approvers can leave inline comments on specific data points
- **Comparison table** — "Legacy vs. Sweep" showing value proposition clearly

**What we should steal:**
- The 6-step linear workflow as a progress tracker in our sidebar or top bar
- The materiality matrix export feature (we have the SVG, need PNG/Excel export)
- Campaign-style data collection tracking per department

---

### 2. EQS Group (Sustainability Cockpit) — Best Enterprise UI
**Design Language:** Corporate blue + white. Dashboard-heavy, data-rich.
**Standout Features:**
- **Module-based navigation:** CSRD Reporting, CO2 Footprint, Double Materiality, VSME, EU Taxonomy as separate modules
- **Step-by-step reporting workflows** with AI-enhanced report creation
- **Double Materiality Module:** stakeholder management, 92 EFRAG topics with custom additions, interactive surveys, weighted scoring
- **EU Taxonomy Module:** decision trees for activity classification, real-time dashboards
- **AI-driven features:** data recognition for carbon footprint, intelligent emission factor assignment
- **Multi-language:** EN, DE, FR, IT, ES built in
- **Customizable data points** with "If-Applicable" concept — data points that only appear when relevant

**What we should steal:**
- The "If-Applicable" concept for metric collection — hide irrelevant metrics
- Decision tree UI for EU Taxonomy activity classification
- 92 EFRAG topic preload in DMA (we have 10 standards, they have 92 sub-topics)

---

### 3. Workiva — Best Report Editor
**Design Language:** Clean, document-centric. Looks like Google Docs meets Bloomberg.
**Standout Features:**
- **ESG Fact Book spreadsheet** — define topics, metrics, and collect values in a structured spreadsheet interface
- **Customizable KPI Dashboard** with real-time visibility throughout the year
- **Peer benchmarking** with industry market data import
- **Collaborative document editing** for sustainability reports (multi-user, tracked changes)
- **Cross-linking** — changes in data automatically update across connected reports and dashboards
- **Audit trail** showing data lineage from source to published report

**What we should steal:**
- Spreadsheet-like data collection interface (our grid is read-only, should be editable inline)
- Cross-linking where changing a data point auto-updates the report section
- Peer benchmarking panel on dashboard

---

### 4. Persefoni — Best Carbon UX
**Design Language:** Modern dark mode option. Data visualization heavy.
**Standout Features:**
- **Guided setup wizard** — short series of questions to customize the experience and build a data collection checklist
- **Footprint Ledger** — audit logs tracking when data is added/modified/deleted with user attribution
- **Calculation transparency** — shows accounting frameworks, formulas, conversion factors per calculation
- **Emissions visualization** — Scope 1/2/3 breakdown charts, trend analysis, hotspot identification
- **Persefoni Copilot** — GPT-style chat interface for carbon accounting Q&A
- **Scenario modeling** — model different decarbonization paths visually

**What we should steal:**
- Guided setup wizard for new tenants (we have Setup page, but no guided onboarding flow)
- Calculation transparency — showing HOW each metric was calculated/derived
- AI Copilot chat interface for ESG questions (beyond just narrative generation)

---

### 5. Novisto — Best Data Collection UX
**Design Language:** Clean, modern SaaS. Blue accent.
**Standout Features:**
- **Customizable dashboards** for different management levels (board, executive, department)
- **Finance-grade audit trails** with approval workflows
- **Analytics dashboards** comparing ESG performance against industry peers with curated metrics
- **Guided workflows + REST APIs + AI-powered bulk imports** for data collection
- **Framework mapping** — same data mapped to multiple frameworks simultaneously
- **Trend visualization** — map insights directly into reporting outputs

**What we should steal:**
- Role-based dashboards (different views for board, sustainability team, data owners)
- Framework cross-mapping visualization (showing same data point mapped to GRI + ESRS + ISSB)

---

### 6. Plan A — Best Decarbonization UX
**Design Language:** Green + white. Simple, approachable for non-technical users.
**Standout Features:**
- **Decarbonization Analytics Dashboard** — real-time progress tracking against targets
- **Scenario planning** — create credible scenarios with customizable visualizations
- **Emissions hotspot identification** — visual highlighting of highest-impact areas
- **Scope 3 integration** — supply chain emissions mapped to suppliers
- **Reduction recommendations** — platform suggests specific reduction actions

**What we should steal:**
- Target tracking with progress visualization (our DMA doesn't track progress over time)
- Reduction recommendations based on data (AI suggesting improvement actions)

---

## Common UI Patterns We're Missing

| Pattern | Who Does It | Our Status | Priority |
|---------|-------------|------------|----------|
| **Linear workflow progress bar** (5-6 steps always visible) | Sweep | We have steps on Setup page but not persistent | HIGH |
| **Inline editable data grid** (edit values directly in the table) | Workiva | Our grid is read-only | HIGH |
| **Dark mode** | Persefoni | Not implemented | LOW |
| **Guided onboarding wizard** (first-time setup) | Persefoni | Setup page exists but no wizard | MEDIUM |
| **Role-based dashboards** (board vs. data owner vs. auditor) | Novisto | Single dashboard for all | MEDIUM |
| **Framework cross-mapping** (show GRI + ESRS + ISSB for same metric) | Novisto | We have GRI/ISSB fields but don't show them | MEDIUM |
| **Calculation transparency** (show formula behind each value) | Persefoni | Not shown | MEDIUM |
| **Peer benchmarking** | Workiva, Novisto | Not implemented | LOW |
| **Decision trees** for EU Taxonomy | EQS Group | Not implemented | HIGH (Phase 5) |
| **Materiality matrix export** (PNG, Excel) | Sweep | We have SVG display only | LOW |
| **Campaign tracking** (data collection progress by department) | Sweep | Not implemented | MEDIUM |
| **AI chat copilot** | Persefoni | We have API-only AI, no chat | LOW |

---

## Design Language Comparison

| Platform | Primary Color | Style | Density | Target User |
|----------|--------------|-------|---------|-------------|
| Sweep | Green + White | Airy, modern | Low-medium | Sustainability teams |
| EQS Group | Blue + White | Corporate | High | Enterprise compliance |
| Workiva | Blue + Gray | Document-centric | High | Finance/audit |
| Persefoni | Teal + Dark | Modern SaaS | Medium | Climate/carbon teams |
| Novisto | Blue + White | Clean SaaS | Medium | ESG data managers |
| Plan A | Green + White | Approachable | Low | SME sustainability |
| **Our Platform** | **Slate + Blue** | **Dark sidebar, cards** | **Medium** | **CSRD compliance** |

Our current design sits between Sweep (clean) and EQS Group (data-rich). The Tailwind dark sidebar + card layout is competitive. Main gaps are interactivity (inline edit, export) and guided workflows.

---

## Top 5 UX Improvements to Prioritize

1. **Persistent workflow progress bar** — Show "Step 2 of 6: Data Collection" at the top of every page, like Sweep's 6-step flow
2. **Inline editable data grid** — Click a value in the data collection table to edit it directly (like Workiva's spreadsheet approach)
3. **Department-based data collection campaigns** — Track collection progress by department with % completion (like Sweep)
4. **GRI/ISSB cross-mapping display** — Show which other frameworks each metric maps to (like Novisto)
5. **Guided onboarding** — First-time wizard: "What's your company name? Country? CSRD Wave?" → auto-creates tenant + period (like Persefoni)

---

Sources:
- [Workiva ESG Reporting](https://www.workiva.com/solutions/esg-reporting)
- [Sweep Platform](https://www.sweep.net/platform)
- [Sweep CSRD](https://www.sweep.net/csrd)
- [EQS Sustainability Platform](https://www.eqs.com/platform-sustainability/)
- [EQS Double Materiality](https://www.eqs.com/platform-sustainability/double-materiality-analysis/)
- [Novisto Solutions](https://novisto.com/solutions)
- [Persefoni Carbon Accounting](https://www.persefoni.com/business/carbon-footprint-measurement-analytics)
- [Plan A Product](https://plana.earth/product)
