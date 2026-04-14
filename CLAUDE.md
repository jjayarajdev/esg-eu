# EU ESG Platform — Claude Code Operating Rules

## Project Context

Building an EU ESRS compliance SaaS platform (modular monolith, Node.js + ReactJS, AWS).
Solo developer, self-funded, zero ESRS domain knowledge.

---

## Workflow Orchestration

### #1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### #2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### #3. Self-Correction Loop
- After every correction from the user, update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project context

### #4. Verification Before Delivery
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### #5. Bounded Elegance (balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If it feels hacky: "knowing everything I know now, implement the elegant solution"
- Bias for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### #6. Autonomous Bug Fixing
- When given a bug report, just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve
- Zero context switching: resolve from end to end
- Go fix failing CI tests without being told how

---

## Task Management

- **Plan First:** Write plan to `tasks/todo.md` with checkable items
- **Priority Checks:** Check in before starting (alignment with user)
- **Track Progress:** Mark items complete as you go
- **Quick Changes:** Highlight summary at each step
- **Document:** Add review section to `tasks/todo.md`
- **Capture Updates:** Update `tasks/lessons.md` after corrections

---

## Security Rules (from Security Playbook)

### Authentication & Sessions
- Set session expiration limits. JWT sessions must never exceed 7 days. Use refresh token rotation.
- Never build auth from scratch. Use Clerk, Supabase, or Auth0.
- Keep API keys strictly secured. Use `process.env` keys only.

### Secure API Development
- Rotate secrets every 90 days minimum.
- Verify all suggested packages for security before installing.
- Always opt for newer, more secure package versions.
- Run `npm audit fix` after every build.
- Sanitize all inputs using parameterized queries always.

### API & Access Control
- Enable Row-Level Security in the DB from day one.
- Remove all `console.log` statements before deploying to production.
- Use CORS to restrict access to allow-listed production domains only.
- Validate all redirect URLs against an allow-list.
- Add auth and rate limiting to every endpoint.

### Data & Infrastructure
- Cap AI API costs within code and dashboard.
- Add DDoS protection via CloudFront/AWS WAF.
- Lock down storage access so tenants can only access their own files.
- Validate upload limits by file signature, not by extension.
- Verify webhook signatures before processing payment data.

### Other Security Rules
- Review permissions — server-side UI-level checks are not security. Enforce at API/DB layer.
- Log critical actions: deletions, role changes, payments, exports (audit trail for ESRS assurance).
- Build real account deletion flows (GDPR compliance — mandatory for EU platform).
- Automate backups then actually test them. An untested backup is useless.
- Keep test and production environments fully separate.
- Never let webhooks touch real systems in the test environment.

---

## Core Principles

- **Simplicity First:** Make every change as simple as possible. Minimal code impact.
- **No Laziness:** Root cause fixes. No temporary fixes. Senior developer standards.
- **Minimal Impact:** Changes should only touch what's necessary. Avoid introducing bugs.

---

## Tools & Workflow

- Use **memory** system to persist decisions, user preferences, and project context across sessions
- Use **tasks** (TaskCreate/TaskUpdate) to track work within sessions
- Maintain `tasks/lessons.md` as a living self-correction document
- Use **subagents** for research, exploration, and parallel analysis
- Use **plan mode** before any non-trivial implementation
