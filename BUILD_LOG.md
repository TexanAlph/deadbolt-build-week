# Deadbolt Build Log

This is the dated evidence trail for the OpenAI Build Week build. Log material model work, Codex techniques, decisions, repairs, validation, and deployment proof here.

## Submission readiness — 2026-07-21

- Ran the complete project suite: lint, TypeScript, core remediation safeguards,
  report-label honesty checks, bounded live-verification contract, and the
  production Next.js build all pass.
- Performed a clean-room plugin installation using a temporary Codex home:
  the local marketplace registered, `deadbolt@deadbolt-build-week` installed,
  and Codex reported the plugin enabled.
- Expanded `SUBMISSION.md` into a Devpost-ready project description, judge
  walkthrough, accurate product-boundary statement, and time-boxed video plan.

## Current proof boundary — 2026-07-19

- **Proven keyless surface:** the packaged `$deadbolt` Codex Skill can perform
  a source-code reasoning audit without `OPENAI_API_KEY`. Its InvoicePilot
  walkthrough directs a judge to inspect the IDOR evidence path.
- **Not claimed as proven:** the API-backed TypeScript engine’s live GPT-5.6
  hunt, patch planning, and patched-code re-analysis. Those paths require
  `OPENAI_API_KEY` and remain pending a real API run.
- Historical fixture results below are deterministic development evidence. They
  are not evidence that the keyless Skill runs the engine loop or that a live
  GPT-5.6 API request succeeded.

### 16:55 CDT — Conversational keyless Skill path validated

- Verified the built-in `skill-installer` accepts the exact public GitHub tree
  URL for the standalone Skill source:
  `https://github.com/TexanAlph/deadbolt-build-week/tree/main/.agents/skills/deadbolt`.
  A bare repository URL is insufficient because the installer needs a Skill
  path.
- Added the two conversational prompts to the README as the primary judge path:
  natural-language installation through the built-in Skill Installer, followed
  by a natural-language local InvoicePilot security audit.
- Performed a fresh, read-only forward test using only a generic request to
  audit local InvoicePilot for security vulnerabilities—without `$deadbolt`.
  Codex implicitly selected the Skill, read its instructions and report
  contract, honored the blind-audit rule, made no network requests or edits,
  and returned evidence-backed findings including the IDOR/BOLA path.
- The existing description already directly matches that request, and
  `agents/openai.yaml` explicitly permits implicit invocation. It remains
  unchanged to keep the project-local and packaged copies identical.
- This validates the keyless Skill-routing and audit surface only. It is not a
  live API-backed TypeScript-engine run, patch, re-analysis, or test execution.

### 18:34 CDT — Submission handoff and keyless judge path surfaced

- Captured and pinned the Codex feedback/conversation session for this build:
  `019f7211-fea5-7652-bde6-777f5694ee1b`.
- Added a prominent homepage `RUN KEYLESS IN CODEX` judge CTA and navigation
  link. It leads to the packaged plugin's InvoicePilot blind-audit walkthrough.
- The CTA explicitly preserves the proof boundary: keyless Codex reasoning is
  read-only and does not claim to run the API-backed engine or verify a patch.
- Validation passed: `npm run lint`, `npm run typecheck`, `git diff --check`,
  and `npm run build`.

### 18:38 CDT — Local live-engine demo setup prepared (no API call)

- Added `npm run prepare:live-sample`, which creates the gitignored
  `work/invoice-pilot-live-input` folder for a fair local API-backed demo.
- The staging command copies only ordinary application/configuration source. It
  deliberately excludes the sample README, vulnerability manifest, seed
  scripts, lockfile, and public assets so they cannot disclose expected results
  to a live model.
- Excluded the gitignored `work/` scratch directory from the root TypeScript
  project so generated sample code cannot affect Deadbolt's own validation.
- Ran the staging command: it produced 22 source/configuration files (42,531
  characters) and the prohibited-material check passed.
- `npm run lint`, `npm run typecheck`, `git diff --check`, and `npm run build`
  passed after the repair. No `OPENAI_API_KEY` was read or used; no live model
  request was made.

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

### 14:46 CDT — Redesigned experience promoted to production

- Authenticated the existing Vercel CLI project link and deployed the validated
  homepage and scan-flow redesign to the existing production target.
- Vercel deployment `dpl_2L7jhMJ8uutpPMBTSDzdL9jTbDoU` reached **Ready** and
  the stable alias remained https://deadbolt-build-week.vercel.app.
- Production verification confirmed:
  - the homepage serves `Scan InvoicePilot now`, the restored cinematic
    bug-finding artwork, the IDOR evidence preview, and the full-loop message;
  - `/analyze` serves the preselected InvoicePilot ready state and the explicit
    patch and re-test stages;
  - `/og.png` returns the final campaign artwork with HTTP 200;
  - `/api/analyze` returns schema `1.0.0`, 8 findings, 8 generated and applied
    patches, 8 passed re-tests, 0 failures, and preserves the original source.

### 15:04 CDT — Public fixture exposure removed and hero focus corrected

- Removed the private experiment from the public product narrative, navigation,
  calls to action, scanner intake, report surface, README quickstart, and
  production API capability response.
- Changed the public `/analyze` experience to accept only owner-supplied source.
  The deterministic report, demo API path, and owned-staging verifier now
  require `DEADBOLT_INTERNAL_DEMO=1`; with the production default they return
  404 and advertise `demoAvailable: false`.
- Removed the public live-staging panel and its hard-coded synthetic target from
  the client bundle while preserving the defensive verifier as an explicitly
  private development capability.
- Edited the campaign artwork to narrow and sharpen the flashlight cone, place
  its brightest hotspot directly on the bug, reduce haze, and replace the
  malformed symbol with a clean symmetrical six-legged red bug.
- Validation passed:
  - no private fixture name or prior sample marketing copy remains in public
    application pages, components, README content, or built HTML/RSC/JS;
  - lint and strict type checking pass;
  - core, report, and live-verifier contracts pass;
  - the production build succeeds;
  - the built `/demo` page has status 404, and both internal API paths return
    404 while the internal flag is absent.

### 15:15 CDT — Flashlight beam and hero resolution corrected

- Replaced the narrow neon ray with a physically readable flashlight cone:
  one filled beam widening from the lens into a broad circular pool centered
  directly on the red bug, with the light terminating at the target.
- Removed the laser-like center line and parallel rails while preserving the
  wordmark, tagline, status label, code graph, bug, arrow, and verified shield.
- Added a dedicated 1730×909 `public/hero.png` for the homepage and retained a
  separate 1200×630 `public/og.png` for link previews, avoiding unnecessary
  hero upscaling from the smaller social asset.
- Lint, strict type checking, and the complete production build pass.

### 15:20 CDT — Beam axis centered and background simplified

- Rebuilt the flashlight cone and target pool around one shared optical axis:
  lens center, cone center, spotlight center, and bug center are now collinear.
- Removed the accidental stack of floating code-window/tab frames and replaced
  it with a restrained flat source-code and data-flow field.
- Added versioned homepage and social assets so the corrected artwork cannot be
  masked by a cached copy of the earlier beam.
- Lint, strict type checking, and the complete production build pass.

### 15:24 CDT — Spotlight locked to the existing optical axis

- Rejected the first alignment pass because the fixed cone still entered the
  spotlight above and to the right of its visual center.
- Kept the flashlight and cone fixed, then moved the spotlight and bug together
  so a line through the lens and the midpoint of both beam edges bisects the
  spotlight pool and bug.
- Assigned a second unique production asset path to prevent the rejected
  intermediate image from surviving in either the browser or image optimizer.
- Lint, strict type checking, and the complete production build pass.

### 15:32 CDT — Hero rebuilt around vertical symmetry

- Rejected further repairs to the angled composition and generated a new hero
  around an unambiguous vertical optical axis.
- Positioned the flashlight directly above the bug and used a bilaterally
  symmetric cone whose lens center, beam midpoint, spotlight center, and bug
  center share the same X coordinate.
- Removed a temporary generated alignment ruler without changing the finalized
  geometry, and kept the background as a flat restrained code/data field with
  no stacked tabs, windows, cards, or panels.
- Added new homepage and social asset paths so no earlier angled artwork can be
  returned by a browser or image-optimizer cache.
- Lint and strict type checking pass. The first production-build attempt hit a
  transient Google Fonts fetch failure; the immediate retry completed with all
  application routes compiled successfully.

### 18:00 CDT — Scan status made report-driven

- Removed the unreachable hard-coded `8/8 VERIFIED` completion state from the
  public analysis console.
- A completed run now transitions directly from the running state to the
  report, whose finding, patch, passed re-test, and failed re-test totals come
  from the returned `AnalysisReport`.
- Confirmed the hard-coded label and synthetic state are absent; lint, strict
  type checking, report rendering verification, and the production build pass.

### 18:17 CDT — Priority 3 uses affected-hunt re-analysis

- Replaced the separate AI “verification verdict” with a fresh run of the same
  affected hunt lens against the isolated patched clone. The patched source
  goes through evidence reduction again before GPT-5.6 Sol receives the
  original finding as a verification target.
- A finding turns green only when the fresh affected-class hunt omits the
  original root cause. Stable IDs are preferred; category and overlapping
  evidence paths provide a conservative fallback. A missing hunt result or a
  still-present root cause fails closed.
- Kept the existing `retestStatus` and `retestEvidence` wire fields for schema
  compatibility, but corrected product and report copy: live results say “hunt
  re-analysis,” private fixture results say “deterministic source invariant,”
  and both explicitly state that no executable tests ran.
- Added verifier coverage for all three decision outcomes: root cause absent
  becomes green, root cause still present remains red, and missing fresh-hunt
  evidence remains red.
- Validation passed:
  - `npm run lint`;
  - `npm run typecheck`;
  - the core-loop, server-rendered report, and owned-staging contract verifiers;
  - `npm run build` (a transient Google Fonts connection failure on the final
    validation pass cleared on the immediate retry).
- Live GPT-5.6 execution remains pending `OPENAI_API_KEY`; no live model result
  is claimed by this implementation-only validation.

### 20:05 CDT — Re-analysis now fails closed and preserves new findings

- Replaced absence-by-omission with a target-specific verification contract:
  every patched-code hunt must return one `absent`, `present`, or
  `inconclusive` conclusion per original finding, with non-empty coverage and
  patched-source evidence.
- An empty result, missing conclusion, conflicting conclusions, missing
  original evidence paths, incomplete coverage, an inconclusive verdict, or a
  failed model call now remains red. None of those states can become green.
- A green result now requires a complete `absent` conclusion, coverage of every
  original evidence path, and citations limited to files the re-hunt reports
  checking.
- Re-analysis uses settled hunt calls so one failed lens becomes explicit red
  evidence instead of silently clearing a target. Findings discovered during
  the patched-code hunt are normalized as open, unpatched findings and included
  in the top-level report so the overall report cannot claim an all-green loop.
- Added regression checks for complete absence evidence, lingering roots,
  missing passes, omitted target conclusions, schema rejection of empty model
  output, and preservation of a newly discovered post-patch finding.
- `npm run typecheck` and the core verifier pass. The verifier was invoked with
  `node --import tsx` because the sandbox denied the `tsx` CLI's local IPC
  socket.
- Live GPT-5.6 behavior remains pending `OPENAI_API_KEY`; no live-model result
  is marked verified.

### 22:50 CDT — Keyless Skill routing covers audit and fix language honestly

- Broadened the distributable `$deadbolt` Skill description to cover natural
  audit language (`audit`, `review`, `scan`, `check`, and “is this code
  secure?”) as well as requests to fix or patch security issues.
- Added an explicit audit-only response contract for fix/patch requests:
  Deadbolt performs the evidence-backed audit and recommends remediation, but
  does not edit code, apply a patch, run tests, or claim verification. The
  separate API-backed TypeScript engine owns hunt → patch → re-analysis.
- Forward-tested plain-English audit, check, find, security-review, fix, and
  patch prompts with fresh/read-only Codex agents; each selected Deadbolt and
  kept the no-edit/no-verification boundary.
- Validated the package YAML/JSON frontmatter with Ruby parsers and ran
  `git diff --check`. The project-local `.agents` mirror could not be updated
  in this sandbox because it is mounted read-only; judge plugin installs use
  the updated `codex-plugin/plugins/deadbolt` package.

### 22:56 CDT — Isolated distributable-package test

- Created a temporary `CODEX_HOME` outside the project, registered the local
  `codex-plugin` marketplace, and installed
  `deadbolt@deadbolt-build-week` version `0.1.0+codex.20260720225000`.
  Codex reported it installed and enabled; the cached installed `SKILL.md`
  byte-matches the package source.
- Copied InvoicePilot into that temporary area so a new `codex exec` process
  would not discover this project’s local `.agents` mirror. The process ran
  with `--ephemeral` and `--sandbox read-only` and received an ordinary
  “Find security issues” prompt with no `$deadbolt` sigil.
- The final model-routing assertion is pending network availability: the outer
  sandbox could not resolve `chatgpt.com`, so Codex exhausted its retries before
  a model response. This is an honest environment block, not a passing
  activation result. The installation/distribution path itself is verified.

### 17:51 CDT — Judge-testable keyless Codex Skill packaged

- Packaged `$deadbolt` as a self-contained `codex-plugin/` distribution with a
  standard local marketplace manifest, validated plugin manifest, standalone
  Skill instructions, agent metadata, and audit report contract.
- The Skill is deliberately audit-only: it uses a signed-in Codex agent to
  reason over source code without `OPENAI_API_KEY`; it does not invoke
  `src/lib/analysis` or claim the API-backed hunt → patch → re-analysis loop.
- Added a keyless InvoicePilot walkthrough that asks for a read-only audit and
  names the concrete IDOR evidence path the judge should independently verify.
- The environment lacked PyYAML, so the supplied Python plugin validator could
  not start. Equivalent JSON/YAML manifest preflight checks passed, and an
  isolated `CODEX_HOME` install test successfully added the local marketplace
  and installed `deadbolt@deadbolt-build-week`.
- No live OpenAI API request was made or marked verified.

### 18:09 CDT — Keyless Skill made blind to InvoicePilot ground truth

- Removed the InvoicePilot-specific finding, route names, and expected outcome
  from the executable packaged Skill. The Skill now requires a blind source
  audit: it must defer READMEs, `VULNERABILITY_MANIFEST.json`, `BUILD_LOG.md`,
  and seed/verification scripts until after its report.
- Kept the detailed IDOR evidence path only in the human-facing README, which
  explicitly labels it as a post-report judge checklist rather than model
  prompt context.
- Updated the plugin cachebuster to `0.1.0+codex.20260719230819` and installed
  that exact version into an isolated Codex home. A specific-oracle scan of the
  installed Skill passed; it no longer contains the InvoicePilot route/data
  answer.
- This strengthens the keyless audit demonstration but does not verify any
  live API-backed engine run.

### 20:52 CDT — Patch application is line-targeted and replayable

- Extended every live patch edit with an exact one-based `startLine` and
  `endLine`. Application now requires one unambiguous path and validates the
  exact expected whole-line source at that location; it never falls back to
  first-occurrence replacement.
- Rejects empty expected source, no-op replacements, invalid ranges, ambiguous
  duplicate paths, overlapping edits, stale line content, and edits that
  overlap a previously applied plan. A failed plan is atomic and leaves the
  sandbox unchanged.
- Multiple non-overlapping edits account for earlier line-count changes while
  retaining original source coordinates. The fixture’s static patch templates
  are accepted only when their expected source is unique and line-aligned.
- Replaced the placeholder hunk marker with standard unified-diff headers and
  numeric hunk ranges. A regression replays the produced diff with the system
  `patch` utility and proves the resulting file exactly matches the in-memory
  sandbox.
- A proposed plan that cannot apply now remains `generated`/proposed with
  `not_run` re-analysis; it is never labeled applied. The report explains when
  no replayable diff is available.
- Added focused regressions for a repeated snippet targeted at line three, a
  wrong-line mismatch, a no-op rejection, sandbox immutability on failure, and
  external unified-diff replay.
- `npm run typecheck` and the core verifier pass.
- Live GPT-5.6 patch generation remains pending `OPENAI_API_KEY`; no live-model
  patch or re-analysis result is marked verified.

### 21:04 CDT — Final local validation complete

- Split browser upload path handling into a client-safe module after the first
  production build correctly rejected a client import of the server-only
  repository loader.
- Replaced build-time Google Font downloads with locally hosted Geist and Geist
  Mono assets through `next/font/local`, removing an external network
  dependency from production builds.
- Switched the project build script to Next.js 16’s documented
  `next build --webpack` path because Turbopack’s CSS worker attempted to bind a
  local port forbidden by the validation sandbox. The Webpack production build
  compiled every route successfully.
- Final validation passed:
  - `npm run lint`;
  - `npm run typecheck`;
  - core analysis, server-rendered report, and bounded owned-staging contract
    verifiers;
  - `git diff --check`;
  - `npm run build`.
- No live OpenAI request or staging probe was performed. GPT-5.6 hunt quality,
  live structured-output compliance, and live patched-code re-analysis remain
  pending an API key.

### 19:43 CDT — Cold judge-install guide verified

- Verified the actual distribution layout before documenting it: the
  `codex-plugin/.agents/plugins/marketplace.json` marketplace points to
  `codex-plugin/plugins/deadbolt`, whose manifest bundles the `skills/deadbolt`
  Skill. `.agents/skills/deadbolt` is a byte-identical project-local mirror;
  the repository has no separate `.codex/skills` setup.
- Confirmed with the installed Codex CLI that `plugins` is stable and there is
  no separate `skills` feature flag to enable. Bundled Skills are available in
  a new task/session after the plugin is installed.
- Performed a fresh isolated install using
  `codex plugin marketplace add "$PWD/codex-plugin"` followed by
  `codex plugin add deadbolt@deadbolt-build-week`. The plugin installed as
  version `0.1.0+codex.20260719230819`, enabled successfully, and required no
  `OPENAI_API_KEY`.
- Replaced the README judge quick start with a non-technical, copy/paste cold
  walkthrough, an honest expected-IDOR evidence checklist, an explicit
  keyless boundary, and three concrete recovery paths. This validates packaging
  and discovery only; it does not constitute a live API-backed engine run.
- Updated the public `RUN KEYLESS IN CODEX` CTA to target the new README
  heading rather than the retired judge-quick-start anchor.

### 20:39 CDT — Finding IDs and browser intake are repository-safe

- Added a deterministic pre-distillation ID boundary for the four independent
  live hunt passes. The first requested ID is preserved; every cross-agent
  collision receives a class-scoped canonical ID before patch plans, maps, or
  re-analysis can use it.
- Added schema enforcement for non-empty IDs, uniqueness within each hunt pass,
  global uniqueness across passes and top-level findings, and the requirement
  that every pass finding exists in the report index.
- Newly discovered post-patch findings are also uniquified against every
  original finding ID before entering the report.
- Converted the browser intake to a real directory picker using
  `webkitdirectory` plus the compatible `directory` attribute. The selected
  root folder is stripped while nested repository paths are preserved, and
  duplicate normalized paths are excluded instead of ambiguously selecting the
  first basename.
- Added regressions for cross-agent `DB-001` collisions, schema rejection of
  duplicate report IDs, repository-relative nested paths, and the rendered
  directory-picker attribute.
- `npm run typecheck`, the core verifier, and the report renderer verifier pass.
- Live GPT-5.6 behavior remains pending `OPENAI_API_KEY`; no live-model result
  is marked verified.

### 20:27 CDT — Zero-finding scans render a complete honest report

- Replaced the `null` zero-finding branch with a dedicated report state that
  shows zero findings, completed hunt coverage, files analyzed, no patches
  needed, the unchanged-repository boundary, per-lens clean evidence, and the
  raw structured contract.
- The green “No vulnerabilities found in this scan” state is gated on every
  requested hunt class completing with non-empty checked-file coverage. A
  zero-finding report with incomplete coverage instead renders `SCAN
  INCOMPLETE` and makes no clean claim.
- The clean state explicitly says that no evidence-backed findings in the
  bounded snapshot are not a guarantee that the code has no vulnerabilities.
- Added a server-rendering regression proving the zero-finding report is
  visible and contains neither patch-success nor full-loop-success copy.
- `npm run typecheck` and the report renderer verifier pass.
- Live GPT-5.6 behavior remains pending `OPENAI_API_KEY`; no live-model result
  is marked verified.

### 20:18 CDT — Result claims are conditional and the hero is claim-free

- Replaced the homepage hero and active Open Graph image with edited,
  production-sized assets that preserve the centered flashlight/bug
  composition while removing the baked `BUILD COMPLETE · 8/8 GREEN` panel,
  checked shield, arrow, and every other visual result claim.
- Changed the homepage accessibility copy from “proves the fix” to the honest
  statement that Deadbolt re-analyzes patched code to confirm a fix.
- Report success styling, progress stages, patch-state headline, comparison
  note, and footer now derive from actual patch and re-analysis status.
  Proposed, unapplied, failed, and unrun states use explicit incomplete/red
  language and never render `Focused fix applied`, a verified verdict badge, or
  `FULL LOOP COMPLETE`.
- Updated the README capability comparison to say patched-code re-analysis
  instead of a verified fix.
- Added report rendering regressions for all-passed, proposed/unapplied, and
  applied-but-failed states.
- `npm run typecheck` and the report renderer verifier pass. Both edited images
  were visually inspected at their production dimensions.
- Live GPT-5.6 behavior remains pending `OPENAI_API_KEY`; no live-model result
  is marked verified.

### 22:10 CDT — Pre-submission public-surface cleanup

- Removed six obsolete, claim-bearing image variants from `public/`. The only
  deployable campaign images now are the visually checked, claim-free
  `hero-vertical-axis.png` and `og-vertical-axis.png`.
- Made the keyless `$deadbolt` Codex Skill the homepage’s primary judge path.
  The API-backed homepage card is now explicitly an illustrative local
  remediation flow and states that it is not a recorded run.
- The public analysis console now checks its documented provider capability
  endpoint on load. With no live API provider, source intake and the run action
  are disabled and the UI links to the keyless Skill rather than allowing an
  upload to end in a provider-unavailable response.
- Added `LICENSE` (MIT) and `SUBMISSION.md`, including the Developer Tools
  track, canonical repository, keyless judge path, video placeholder, and
  captured `/feedback` session ID.
- Made the InvoicePilot sample’s `npm run check` delete stale `.next`
  artifacts before type-checking. Its build is now deterministic without remote
  font fetching and uses the supported Webpack build path.
- Validation passed: root `npm run lint`, `npm run typecheck`, and
  `npm run build`; exact sample `npm run check`; `git diff --check`; and
  a browser check of the no-provider deployed-state UI.
- No live OpenAI API run was performed or represented as verified.
