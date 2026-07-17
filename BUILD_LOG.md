# Deadbolt Build Log

This is the dated evidence trail for the OpenAI Build Week build. Log material model work, Codex techniques, decisions, repairs, validation, and deployment proof here.

## Technique register

| Technique | Status | Evidence |
| --- | --- | --- |
| Persistent `/goal` | Active | M0 objective includes outcome, constraints, validation, commit, and live deployment. |
| Review → repair → validate | Active | M0 uses lint, typecheck, production build, runtime check, and a repair pass before completion. |
| Slim `AGENTS.md` | Active | Repository intent, guardrails, milestone discipline, and validation commands are kept in one concise file. |
| Parallel subagent hunts | Planned for M2 | Four independent passes: secrets; auth/IDOR; injection; config/CORS/headers. Do not claim as used before M2. |
| Programmatic Tool Calling | Researched; planned for M2 | Reserved for a bounded evidence-reduction stage with an exact schema, retry limit, and stop condition. |
| Prompt caching | Researched; planned for M2 | Stable repository and threat-model context will precede dynamic scan input; cache reads/writes will be measured. |
| Structured Outputs | Planned for M2 | Findings will use a strict schema rather than best-effort JSON. |

## 2026-07-17

### 16:53 CDT — M0 goal started

- Defined a persistent M0-only goal: scaffold and deploy the foundation, create project guidance and evidence, validate it, commit it, and stop before InvoicePilot.
- Completion proof: live URL, clean lint/typecheck/build, successful runtime response, dated commit, and M0 files in the repository.

### 16:55 CDT — Current OpenAI/Codex guidance loaded

- Fetched the current Codex manual and verified `/goal`, concise `AGENTS.md`, and specialized parallel subagent workflows.
- Checked the current GPT-5.6 model guidance before writing product code.
- Architecture decision for later milestones: use `gpt-5.6-sol` for the hardest threat-model/hunt reasoning, the Responses API for reasoning plus tools, and strict Structured Outputs for findings.
- `reasoning.effort` will be set intentionally and evaluated; `max` is not a blanket default.
- Programmatic Tool Calling is reserved for bounded, predictable reduction of tool evidence—not used merely because calls can run in parallel.
- Prompt caching will keep stable instructions/repository context before dynamic input and will track `cached_tokens` plus `cache_write_tokens`.

Official references:

- https://developers.openai.com/api/docs/guides/model-guidance?model=gpt-5.6
- https://developers.openai.com/api/docs/models/gpt-5.6-sol
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/prompt-caching

### 17:00 CDT — Next.js foundation created

- Initialized a Next.js 16 App Router project with TypeScript, Tailwind CSS 4, ESLint, and npm.
- Read the version-bundled Next.js layout/page, CSS/Tailwind, font, and metadata guidance before changing the scaffold.
- Replaced the generic starter with an M0 product shell that clearly labels the foundation state, future core loop, and self-audit-only boundary.
- Added repository scripts for lint, typecheck, build, and the combined validation loop.

### M0 validation and deployment

### 17:06 CDT — Review → repair → validate

- `npm run lint` — pass.
- `npm run typecheck` — pass.
- `npm run build` — pass; `/` and `/icon` prerender as static routes.
- Local runtime request — HTTP 200 with the expected Deadbolt page title.
- Dependency audit initially found a moderate advisory in Next.js's pinned PostCSS version. Added a narrow npm override to PostCSS 8.5.19, regenerated the lockfile from a clean dependency tree, and re-ran the audit.
- `npm audit --audit-level=moderate` — pass, 0 vulnerabilities.
- Removed unused starter artwork and the generic favicon.

### 17:07 CDT — First Vercel deployment repair

- The Vercel build compiled and prerendered every route, then failed because the newly created project had defaulted to the generic `public` output preset.
- Added a checked-in `vercel.json` that declares the Next.js framework and clears the generic output-directory override.
- Re-deployed the same M0 application with the corrected hosting contract.

### 17:09 CDT — M0 live

- Production deployment status: **Ready**.
- Stable URL: https://deadbolt-build-week.vercel.app
- Production verification: HTTP 200 with the expected Deadbolt page title.
- M0 is complete. Stop here before starting InvoicePilot (M1).
