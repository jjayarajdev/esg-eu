# Lessons Learned

Self-correction log. Updated after every user correction to prevent repeating mistakes.

---

## Format

Each entry:
- **Date:** YYYY-MM-DD
- **Mistake:** What went wrong
- **Correction:** What the user said
- **Rule:** The rule to follow going forward

---

## Entries

### 2026-04-14 — Initial Setup
- **Pattern:** User prefers to be asked clarifying questions before any planning or implementation begins
- **Rule:** Always gather requirements and confirm decisions before starting work. Don't assume.

### 2026-04-14 — Tech Stack Pivot
- **Pattern:** User initially chose Rust but had no Rust experience. When trade-offs were explained clearly, pivoted to Node.js.
- **Rule:** When the user makes a tech choice that has significant risk given their context, flag the trade-offs honestly and offer alternatives. Don't just go along with it.

### 2026-04-15 — Local Postgres Port Conflict
- **Pattern:** User has a local PostgreSQL running on port 5432. Docker Compose also mapped to 5432, causing connections to hit the local instance (which lacks the "esg" role).
- **Rule:** Use port 5433 for Docker Postgres to avoid conflicts with local installations. Always verify DB connectivity after starting containers.

### 2026-04-15 — Module Location in Monolith
- **Pattern:** Putting domain modules in separate `modules/` workspace packages created TypeScript rootDir conflicts when importing from `apps/api/src/infrastructure/`.
- **Rule:** For a monolith, keep domain module code inside `apps/api/src/modules/`. The external `modules/` directory stubs remain for future microservice extraction, but active code lives in the API app.

### 2026-04-15 — SQL File Loading in NestJS Watch Mode
- **Pattern:** `fs.readFileSync(path.join(__dirname, 'file.sql'))` fails in NestJS watch mode because `__dirname` points to dist/ but SQL files aren't compiled.
- **Rule:** Use a fallback path resolver that checks both dist and src paths, or embed SQL as string constants.

### 2026-04-15 — NULL in Unique Constraints (Dedup Issue)
- **Pattern:** PostgreSQL treats NULL != NULL in unique constraints. The upsert ON CONFLICT (metric_def_id, reporting_period_id, department_id) failed to dedup when department_id was NULL.
- **Rule:** Use delete-then-insert pattern when unique constraint columns can be NULL. Or use COALESCE in the constraint.

### 2026-04-15 — Foreign Key on created_by/updated_by
- **Pattern:** Tenant tables had FK constraints on created_by → users(id), but mock auth uses tenant ID as user ID, which doesn't exist in users table.
- **Rule:** Don't include created_by/updated_by in INSERT statements until real auth creates actual user records in the tenant schema.

### 2026-04-15 — Report Finalize Blocked by Empty Sections
- **Pattern:** Report generation skipped sections with no data points, leaving them as "pending". Finalize then blocked because pending sections existed.
- **Rule:** Generate AI narratives for ALL material topics, even those without data. Use context prompt "no data available, generate policy narrative."

### 2026-04-15 — Export Links Need Auth Headers
- **Pattern:** HTML anchor tags (<a href>) opening in new tabs don't carry X-Tenant-Id headers, causing 401 on export endpoints.
- **Rule:** Use fetch() + blob URL for authenticated file downloads instead of direct links.

### 2026-04-15 — CWD Drift in Bash Sessions
- **Pattern:** Running `cd apps/api && npx ts-node ...` changed the working directory for subsequent commands, causing `git add` path failures.
- **Rule:** Always use absolute paths or reset to project root. Avoid cd in bash commands.
