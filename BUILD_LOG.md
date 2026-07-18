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

### 18:22 CDT — M3 live

- Production deployment status: **Ready**.
- Stable URL: https://deadbolt-build-week.vercel.app
- Deployment ID: `dpl_BkzCmbZp5dfvYcg7Siw57YQvfAcW`.
- Production `/` — HTTP 200 with the M3 status and `Run the report` CTA.
- Production `/analyze` — HTTP 200 with the security-report title, M3 status,
  and human-stakes intake copy.
- Production `/og.png` — HTTP 200, `image/png`, updated 858,825-byte campaign
  asset with the scan beam focused on the bug.
- Production InvoicePilot analysis — HTTP 200, 8 findings, 4 passes, IP-003
  present as the report lead candidate, and injection preserved as the clean
  class.
- M3 is live. Stop before M4 patch generation.

### 18:37 CDT — M4 focused patch engine complete

- Added a generic exact-edit patch engine that clones the owner-supplied
  repository snapshot before applying any change.
- Added eight focused InvoicePilot patch plans. Every plan emits a unified,
  reviewable per-finding diff and applies atomically; a stale expected substring
  stops that finding instead of silently changing different source.
- The deterministic fixes cover the client/server secret boundary, owner-bound
  RLS, tenant-scoped invoice lookup, login throttling, explicit CORS, safe error
  responses, cookie expiration, and browser security headers.
- The original vulnerable InvoicePilot source remains unchanged. This preserves
  the before deployment and makes the sandbox boundary truthful in the report.
- Extended the live OpenAI provider with strict Sol patch-plan Structured
  Outputs and the same exact-edit sandbox engine. This code path is wired but
  remains credential-unvalidated, consistent with the existing Sol disclosure.

### 18:37 CDT — M5 red → green re-test loop complete

- Added a finding-specific security invariant for all eight InvoicePilot
  findings and attached the result plus human-readable evidence to each final
  finding.
- Promoted the report contract to schema `1.0.0` with `patchStatus`,
  `retestStatus`, `retestEvidence`, and aggregate remediation counts.
- The fixture proves 8 patches generated, 8 applied to the isolated clone, 8
  re-tests passed, 0 failed, and the original source unchanged.
- Extended the live provider with a second max-reasoning Sol Structured Output
  pass over the patched clone. It must explicitly pass or fail each applied
  finding and state the remaining proof gap.
- Updated the product report from a future-state promise to a reviewable
  red → green experience: before/after stakes, exact diff, re-test evidence,
  and a final `PATCHED + VERIFIED` verdict.

### 18:37 CDT — M6 one-click demo complete

- Added `/demo`, a server-rendered, pre-run InvoicePilot report that requires no
  signup, GitHub connection, API credential, CodeQL, or CI.
- Updated the homepage primary action to open this completed report directly.
- Kept `/analyze` as the interactive owned-source intake and labeled the
  deterministic versus live-model boundary explicitly.

### 18:37 CDT — M7 owned-staging verification complete

- Added an ownership file to InvoicePilot and a defensive live-verification API.
- The production policy permits only exact configured owned hostnames, requires
  HTTPS and a matching ownership token, rejects credentials, custom ports, and
  redirects, limits every response body, applies a six-second timeout, and
  rate-limits callers.
- The verifier performs only four documented synthetic checks: missing browser
  headers, wildcard CORS, cross-tenant invoice 2044, and verbose report errors.
  It does not discover endpoints, send payloads, or probe a third party.
- Added a client panel that requires explicit authorization before any network
  request and clearly distinguishes the vulnerable live “before” app from the
  sandboxed green source result.

### 18:37 CDT — M8 `$deadbolt` Skill complete

- Used the built-in skill scaffolder, then placed the final artifact at
  `.agents/skills/deadbolt`, Codex’s documented repo-scoped discovery path.
- The 94-line workflow encodes the self-audit boundary, threat model, four
  independent hunt lenses, evidence standard, focused patch discipline,
  regression checks, and red → green completion rule.
- Added `agents/openai.yaml` UI metadata and a progressive-disclosure report
  contract reference.
- The provided validator initially lacked PyYAML in both system and bundled
  Python runtimes. Installed PyYAML only into a temporary validator directory
  and re-ran the official script: `Skill is valid!`

### 18:37 CDT — M9 judge handoff and local validation

- Rewrote the README around a 30-second judge path, live links, the competitive
  wall, the logic-flaw centerpiece, the complete architecture, Codex/GPT-5.6
  techniques, Skill invocation, local setup, validation, and safety.
- Preserved the honest model disclosure: the Sol/Terra live path is built, but
  no credential was available, so only the deterministic end-to-end provider
  is claimed as executed.
- `npm run lint` — pass.
- `npm run typecheck` — pass.
- `npm run verify:core` — pass: 4 hunts, 8 findings, 8 exact patches, 8 green
  re-tests, original unchanged.
- `npm run verify:report` — pass: product report includes human stakes,
  red → green comparison, patch, re-test proof, and the live gate.
- `npm run verify:live` — pass: exact-host policy, ownership token, four bounded
  checks, and strict result schema.
- `samples/invoice-pilot npm run check` — pass: lint, types, all eight planted
  seeds, production build, and browser-bundle exposure.
- Final root production build, deployments, and production checks follow below.

### 18:44 CDT — M9 production completion proof

- InvoicePilot production deployment: **Ready**.
  - Stable URL: https://invoicepilot-deadbolt-demo.vercel.app
  - Deployment ID: `dpl_6hsUXvBQ1yWHpvHaadhTYs5U5yy2`
  - Ownership file returned the exact expected token.
  - All 14 intentional vulnerable-runtime assertions still passed against the
    stable production URL, preserving the “before” side of the demo.
- Deadbolt production deployment: **Ready**.
  - Stable URL: https://deadbolt-build-week.vercel.app
  - Deployment ID: `dpl_GQ5p26x3hFaYPuHwhriLVdBPRyiu`
  - `/` returned `BUILD COMPLETE · 8/8 GREEN`.
  - `/demo` returned the pre-run `PATCHED + VERIFIED` experience.
  - `/og.png` returned the final 1200×630 bug → verified-shield campaign card.
  - Production `/api/analyze` returned schema `1.0.0`, 8 findings, 8 generated
    and applied sandbox patches, 8 passed re-tests, 0 failures, and
    `originalRepositoryUnchanged: true`.
  - The production capability response remained honest:
    `liveModelConfigured: false`, `mode: fixture`.
  - Production `/api/verify-live` verified the ownership token and confirmed
    IP-008, IP-005, IP-003, and IP-006 on the allowlisted synthetic deployment.
- M0–M9 are implemented, locally validated, committed, deployed, and verified.

### 14:05 CDT — Public GitHub handoff complete

- Verified the authenticated GitHub CLI account `TexanAlph` and its repository
  permissions.
- Created the public repository
  https://github.com/TexanAlph/deadbolt-build-week, added it as `origin`, pushed
  the complete dated `main` history, and enabled upstream tracking.
- The public-code submission requirement is now satisfied.

### 14:33 CDT — Homepage and first-run scan experience redesigned

- Replaced the rendered CSS radar hero with the original 1200×630 campaign
  artwork: a focused beam revealing a red code bug and resolving into a green
  verified shield.
- Rebuilt the homepage as a more cinematic product narrative with a campaign
  frame, a live InvoicePilot command bar, stronger typography, a representative
  IDOR finding, red → green evidence, a four-stage process, and a clearer
  defensive boundary.
- Made the working product path explicit: every primary homepage action now
  opens `/analyze#scan` with InvoicePilot selected, 19 source files and eight
  planted risks summarized, and a three-step first-run guide.
- Updated the analysis console with a visible ready state, ownership guidance,
  a specific `Scan InvoicePilot → patch → re-test` action, and a six-stage
  idle preview that includes patching and re-testing.
- Validation passed:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run verify:core` — 4 hunts, 8 findings, 8 exact patches, 8 green
    re-tests, original unchanged
  - `npm run verify:report` — human stakes, red → green proof, patch diff, and
    live-verification gate
  - `npm run verify:live` — owned-host and bounded-check contracts
  - `npm run build` — all static and dynamic routes compiled successfully
