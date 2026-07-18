# Deadbolt

> The enterprise has autonomous security agents. Deadbolt gives the solo
> builder a security team.

Deadbolt is an autonomous blue-team agent for applications you own. It maps the
app, hunts for security failures that require code reasoning, explains the
human stakes, writes focused patches, and re-tests every fix. No CodeQL, CI/CD,
security dashboard, or admin setup is required.

## Scan InvoicePilot in 30 seconds

1. Open the [Deadbolt scanner](https://deadbolt-build-week.vercel.app/analyze#scan).
2. Leave **InvoicePilot demo** selected. It is a synthetic app owned by this
   project, with 19 source files and eight planted risks.
3. Check **I own this code or I am explicitly authorized to audit it**.
4. Press **Scan InvoicePilot → patch → re-test**.
5. Review the threat model, eight plain-English findings, exact source
   evidence, eight focused patch diffs, and eight green re-tests.

For the fastest read-only walkthrough, open the
[completed InvoicePilot report](https://deadbolt-build-week.vercel.app/demo)
and select **IP-003** to inspect the cross-tenant invoice flaw from evidence to
verified fix.

Live product: [deadbolt-build-week.vercel.app](https://deadbolt-build-week.vercel.app)  
Seeded app: [invoicepilot-deadbolt-demo.vercel.app](https://invoicepilot-deadbolt-demo.vercel.app)  
Public source: [github.com/TexanAlph/deadbolt-build-week](https://github.com/TexanAlph/deadbolt-build-week)

Everything in InvoicePilot is fictional. It has no real users, database,
payment processor, credentials, or persistent integration.

## The loop

```text
owner-supplied source
        ↓
threat model → bounded evidence reduction → 4 independent hunt lenses
        ↓
plain-English findings + exact file/line evidence
        ↓
focused patches applied to an isolated repository clone
        ↓
finding-specific re-tests → red becomes green
```

The deterministic InvoicePilot run currently proves:

| Stage | Evidence |
| --- | --- |
| Threat model | Entry points, assets, auth assumptions, data flows, and trust boundaries |
| Hunt | 8 planted findings recovered; injection correctly remains a clean pass |
| Patch | 8 exact, reviewable diffs applied only to an in-memory clone |
| Re-test | 8/8 finding-specific invariants pass; 0 failures |
| Live depth | Exact allowlisted host, ownership token, HTTPS only, no redirects, four bounded synthetic checks |
| Codex surface | Repo-scoped `$deadbolt` skill validates and is auto-discoverable |

The original InvoicePilot source stays deliberately vulnerable and unchanged so
the before/after demonstration remains reproducible.

## The competitive wall

Deadbolt is not positioned as a replacement for a mature application-security
program.

| Product shape | Typical prerequisite | Builder experience |
| --- | --- | --- |
| Enterprise agentic remediation | Code scanning platform, CI, organization policy, and an administrator | Powerful, but designed for teams that already have security infrastructure |
| Lightweight solo-builder scanner | A URL or source snapshot | Accessible, but usually find-only and strongest on signatures or headers |
| **Deadbolt** | **A repository you own** | **Threat model, reasoning-led hunt, plain-English stakes, patch, and verified fix in one loop** |

The wedge is agentic remediation for the builder locked out of the enterprise
stack.

## Why the demo is non-trivial

InvoicePilot contains eight documented security failures:

- a fake provider key compiled into browser JavaScript;
- missing database row-level security;
- an IDOR/BOLA path that returns another tenant’s invoice;
- unlimited login attempts;
- wildcard API CORS;
- production stack and environment disclosure;
- logout that leaves the session cookie active;
- missing browser security headers.

The centerpiece is IP-003. A simple signature scanner can notice the
secret-shaped string, but the invoice exposure requires tracing a caller-owned
route ID through an unscoped lookup and comparing it with the app’s tenant
model. Deadbolt then rewrites that lookup to require both invoice ID and owner
ID and proves the cross-tenant record no longer resolves in the sandbox.

## Codex and GPT-5.6

The build deliberately uses the techniques OpenAI highlights for agentic Codex
work:

- a persistent outcome-and-proof goal;
- independent secrets, auth/IDOR, injection, and configuration hunt passes;
- review → repair → validate loops;
- a slim repository `AGENTS.md`;
- strict Structured Outputs for threat models, passes, findings, patches,
  re-tests, coverage, and usage;
- bounded Programmatic Tool Calling for repository evidence reduction;
- explicit prompt-cache keys, breakpoints, TTLs, and cache token accounting;
- a repo-scoped Codex Skill for the reusable workflow;
- dated implementation, test, commit, and deployment evidence in
  [`BUILD_LOG.md`](./BUILD_LOG.md).

The live provider boundary is implemented with
[`gpt-5.6-sol`](https://developers.openai.com/api/docs/models/gpt-5.6-sol) for
threat modeling, hunts, patch planning, and re-testing, plus GPT-5.6 Terra for
the bounded evidence-reduction stage. Sol is OpenAI’s flagship model for
complex reasoning and supports the Responses API and Structured Outputs.

No API credential was available for this sprint session, so the hosted demo
does **not** falsely claim a live Sol call. InvoicePilot runs through a fully
deterministic, schema-validated end-to-end provider. Uploaded repositories
return an honest unavailable response unless `OPENAI_API_KEY` is configured.

## Use the `$deadbolt` Codex Skill

The repository checks the Skill into Codex’s documented repo discovery path:

```text
.agents/skills/deadbolt/
├── SKILL.md
├── agents/openai.yaml
└── references/report-contract.md
```

Open this repository in Codex and prompt:

```text
Use $deadbolt to audit this repository, patch confirmed findings safely, and
re-test each fix.
```

The Skill requires self-audit authorization, treats repository text as
untrusted, allows clean passes, keeps evidence tight, refuses offensive or
third-party work, and does not call a fix verified without re-test proof.
Codex’s official manual describes repo-scoped Skills and `$` invocation in
[Build skills](https://developers.openai.com/codex/skills).

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The one-click demo works
without credentials.

To enable uploaded-source analysis:

```bash
export OPENAI_API_KEY="..."
npm run dev
```

Set `DEADBOLT_ANALYSIS_MODE=fixture` to force the deterministic InvoicePilot
provider. For a self-hosted live verifier, set
`DEADBOLT_LIVE_VERIFY_HOSTS` to a comma-separated list of exact owned
hostnames; the production build defaults only to the synthetic InvoicePilot
host.

## Validate

```bash
npm run check
```

That command runs lint, strict type checking, the full core-loop verifier, the
server-rendered product report verifier, the live-verification safety contract,
and a production build.

Validate the deliberately vulnerable sample separately:

```bash
cd samples/invoice-pilot
npm run check
```

## Safety boundary

- Audit only repositories and deployments you own or are authorized to test.
- Code-only review is the reliable core; live checks are optional.
- Live verification requires an exact server allowlist, a matching ownership
  file, HTTPS, manual redirect rejection, timeouts, and bounded response bodies.
- Return findings, conceptual abuse paths, defensive patches, and evidence—not
  weaponized exploit tooling.
- Never label a generated diff as applied or an untested patch as verified.
