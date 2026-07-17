# Deadbolt Build Log

This is the dated evidence trail for the OpenAI Build Week build. Log material model work, Codex techniques, decisions, repairs, validation, and deployment proof here.

## Technique register

| Technique | Status | Evidence |
| --- | --- | --- |
| Persistent `/goal` | Active | M0 objective includes outcome, constraints, validation, commit, and live deployment. |
| Review → repair → validate | Active | M0 and M1 use lint, typecheck, production builds, runtime checks, and repair passes before completion. |
| Slim `AGENTS.md` | Active | Repository intent, guardrails, milestone discipline, and validation commands are kept in one concise file. |
| Parallel subagent hunts | Used for M2 evidence | Independent secrets, auth/IDOR, injection, and config/CORS/header passes confirmed all eight planted flaws; injection correctly remained clean. Runtime hunt contracts are also independent. |
| Programmatic Tool Calling | Implemented; live validation deferred | A bounded Terra evidence reducer exposes only repository search/read tools, caps turns and calls, retries twice, and falls back to local evidence. |
| Prompt caching | Implemented; live measurement deferred | Stable instructions and repository context precede dynamic hunt input; cache keys, breakpoints, TTL, cached tokens, and cache-write tokens are wired. |
| Structured Outputs | Implemented; fixture-validated | Threat model, hunt pass, evidence digest, findings, usage, and final report all parse through strict Zod-backed schemas. |

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

### 17:10 CDT — M1 safety and seed contract

- Scoped InvoicePilot as a separate synthetic SaaS with no database, payment
  processor, email provider, real secrets, real people, or persistent user data.
- Defined eight planted findings in `VULNERABILITY_MANIFEST.json`: a fake key
  compiled into the client, missing row-level security, invoice IDOR, no login
  throttling, wildcard CORS, verbose errors, ineffective logout, and missing
  security headers.
- Added a seed verifier so the vulnerable ground truth remains reproducible
  without shipping exploit tooling.

### 17:18 CDT — InvoicePilot built and verified locally

- Built a responsive multi-route invoice dashboard, demo login, invoice detail
  view, synthetic APIs, six cross-tenant invoice records, and a dedicated social
  preview asset.
- `npm audit` — pass, 0 vulnerabilities in the sample app's framework
  dependencies. The only intentional weaknesses are documented application
  behaviors.
- `npm run lint` — pass.
- `npm run typecheck` — pass.
- `npm run verify:seeds` — pass; all 8 planted findings matched the manifest.
- `npm run build` — pass; dashboard, login, invoice, and API routes compiled.
- `npm run verify:bundle` — pass; the fake secret-shaped key was found in a
  generated browser chunk.
- `npm run verify:runtime` — pass; 14 assertions covered dashboard rendering,
  cross-tenant invoice access, wildcard CORS, absent headers, five unthrottled
  login attempts, persistent logout state, and verbose error disclosure.

### 17:26 CDT — M1 live

- Production deployment status: **Ready**.
- Stable URL: https://invoicepilot-deadbolt-demo.vercel.app
- Deployment ID: `dpl_3Kq5BS9KKCokuV5uJ8yrNShS2Q6N`.
- Re-ran `BASE_URL=https://invoicepilot-deadbolt-demo.vercel.app npm run
  verify:runtime` against production — all 14 assertions passed.
- Verified the production metadata resolves the 1200×630 social card at
  `https://invoicepilot-deadbolt-demo.vercel.app/og.png`.
- M1 is complete. Stop here before starting the GPT-5.6 Sol hunt pipeline (M2).

### 17:32 CDT — M2 parallel evidence review

- Delegated the four vulnerability classes required by `AGENTS.md` to
  independent review passes.
- Secrets confirmed IP-001.
- Auth/IDOR confirmed IP-002, IP-003, IP-004, and IP-007, including the
  cross-file IDOR chain through the unscoped invoice lookup.
- Injection found no SQL, shell, template, or code-evaluation sink—the intended
  negative control.
- Config/CORS/headers confirmed IP-005, IP-006, and IP-008.
- The review findings were distilled in the main task before implementation.

### 17:43 CDT — Current model contract verified

- Re-checked the current official GPT-5.6 guidance and installed the official
  OpenAI JavaScript SDK plus Zod.
- Confirmed the SDK types for GPT-5.6 Sol, explicit `reasoning.effort: "max"`,
  Structured Outputs, programmatic tool callers, prompt cache breakpoints, and
  cache usage fields.
- Kept all model access behind one provider boundary. The user elected to skip
  adding the API credential for now, so no live GPT call is claimed.

### 18:07 CDT — M2 core staged and locally verified

- Added bounded repository intake: 100 files, 40K characters per file, 320K
  characters total, traversal rejection, text allowlisting, and exclusions for
  env files, keys, dependencies, VCS data, and build output.
- Implemented threat-model, evidence-digest, four hunt-pass, finding, coverage,
  usage, and final-report contracts with strict schemas.
- Implemented the live provider path with GPT-5.6 Sol for threat modeling and
  hunts, a bounded Terra Programmatic Tool Calling reducer, cache measurement,
  retries, and deterministic fallback.
- Added the `/api/analyze` boundary with ownership confirmation, request-size
  limits, concurrency and rate limits, safe errors, and no-store/nosniff
  responses.
- Added the `/analyze` intake and M2 contract preview. It labels the engine as
  `FIXTURE · SOL DEFERRED` unless a live model actually ran.
- Added a 1200×630 generated social-preview card and wired absolute Open Graph
  and Twitter metadata.
- `npm run check` — pass: lint, strict typecheck, core verifier, and production
  build.
- Removed an over-broad serverless trace by suppressing dynamic root tracing and
  explicitly including only the 19 InvoicePilot demo files required by the API.
  The production build then completed without warnings.
- `npm audit --audit-level=moderate` — pass, 0 vulnerabilities.
- Local API proof:
  - capability — HTTP 200, fixture mode, live model not configured;
  - InvoicePilot demo — HTTP 200, 8 findings, 4 passes, injection clean;
  - missing ownership confirmation — HTTP 400;
  - uploaded source without a live key — HTTP 503
    `live_provider_unavailable`.
- M2 is staged, not complete. The remaining gate is one live GPT-5.6 Sol run with
  schema validation and measured PTC/cache usage. M3 has not started.

### 18:09 CDT — Staged M2 production deployment

- Production deployment status: **Ready**.
- Stable URL: https://deadbolt-build-week.vercel.app
- Deployment ID: `dpl_765zzXFS2K6Vk7CKnH6KBZu6kcu1`.
- Production `/` — HTTP 200 with Deadbolt content.
- Production `/analyze` — HTTP 200 with the core-engine intake.
- Production `/og.png` — HTTP 200, `image/png`, 1200×630 source asset.
- Production capability endpoint — HTTP 200, fixture mode, live model not
  configured.
- Production InvoicePilot analysis — HTTP 200, fixture provider, 8 findings
  (`IP-001` through `IP-008`), 4 passes, and injection recorded as the clean
  class.
- This deployment proves the staged deterministic core only. It does not satisfy
  the remaining live GPT-5.6 Sol validation gate.

### 18:18 CDT — M3 plain-English report implemented

- The user asked for the campaign image to make the bug discovery more
  explicit. Used the built-in image-generation edit path to preserve the
  established composition while redirecting the scan beam onto one cracked code
  module with a targeted bug glyph.
- Validated the replacement at 1200×630, kept the exact Deadbolt wordmark and
  tagline, changed the milestone label to `M3 · REPORT READY`, and retained it
  as `public/og.png`.
- Replaced the technical contract preview after a run with a judge-facing report
  experience:
  - immediate `NOT READY TO SHIP` verdict and plain-English severity tally;
  - the IDOR/BOLA cross-tenant invoice flaw as the opening story;
  - filterable, selectable findings with everyday-language urgency;
  - linked file-and-line evidence with the reason each location matters;
  - an honest `RIGHT NOW` versus `SAFER TARGET` comparison;
  - threat-model entry points, sensitive assets, and traced data flows;
  - four independent hunt summaries, including injection as a clean pass;
  - visible M4 patch and M5 re-test gates.
- Added pure report-presentation helpers and deterministic tests for severity
  totals, report verdict, lead-finding selection, evidence, safer-target copy,
  and milestone boundaries.
- `npm run check` — pass: lint, strict typecheck, core verifier, report renderer
  verifier, and warning-free production build.
- M3 is complete against the deterministic InvoicePilot pipeline. No patch diff
  or re-test result is fabricated, and the live Sol validation gate remains
  deferred as requested.
