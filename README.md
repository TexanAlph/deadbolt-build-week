# Deadbolt

Deadbolt has two deliberately separate surfaces for auditing repositories you own:

1. **`$deadbolt` Codex Skill — primary judge path.** A keyless, source-code reasoning audit that produces evidence-backed findings. It runs with a signed-in Codex client and does **not** require `OPENAI_API_KEY`.
2. **API-backed TypeScript engine — secondary product path.** The Next.js app in `src/lib/analysis` implements threat model → hunt → patch → re-analysis through the OpenAI Responses API. It requires `OPENAI_API_KEY` and has not yet been verified with a live API run in this submission.

The distinction is intentional. The Skill is not a disguised fixture and does not claim that it runs the TypeScript engine’s patch-and-re-analysis loop.

## Judge quick start: keyless `$deadbolt` audit

This is the fastest way to evaluate the project without rebuilding the web app or supplying an API key.

### Prerequisites

- A signed-in Codex desktop app or Codex CLI with model access.
- Git. No Node installation, `npm install`, or `OPENAI_API_KEY` is needed for this path.

### Install the packaged plugin

```bash
git clone https://github.com/TexanAlph/deadbolt-build-week.git
cd deadbolt-build-week

codex plugin marketplace add "$PWD/codex-plugin"
codex plugin add deadbolt@deadbolt-build-week
```

Start a **new Codex task** in this repository after installing. The packaged marketplace and plugin are self-contained under `codex-plugin/`; the install sequence above was tested in an isolated local Codex home.

### Run the InvoicePilot blind audit

Ask Codex:

```text
$deadbolt Audit only the code I own in samples/invoice-pilot. Work read-only:
build a threat model, inspect authorization end-to-end, and report only
evidence-backed findings with file/line evidence. Do not make network requests
or edit files. Before reporting, do not inspect README files,
VULNERABILITY_MANIFEST.json, BUILD_LOG.md, or seed/verification scripts.
```

The executable Skill has the same blind-audit rule: it must not read the sample
manifest, seed verifiers, fixture documentation, or this README before it
returns a report. The following is therefore a **human judge checklist to use
after the audit**, not prompt context for the model:

- The report should trace a missing invoice-ownership invariant through these
  source locations:
  - [`samples/invoice-pilot/src/app/api/invoices/[id]/route.ts`](./samples/invoice-pilot/src/app/api/invoices/[id]/route.ts), where an untrusted invoice ID reaches a direct lookup without a session or ownership check;
  - [`samples/invoice-pilot/src/lib/data.ts`](./samples/invoice-pilot/src/lib/data.ts), where invoices have `ownerId` but `getInvoiceById` matches only the ID; and
  - [`samples/invoice-pilot/src/app/invoice/[id]/page.tsx`](./samples/invoice-pilot/src/app/invoice/[id]/page.tsx), which repeats the direct lookup on the page route.

The expected conclusion is an IDOR/BOLA risk: a user who can control an invoice identifier can reach another tenant’s record because the request path never proves ownership. Judge the result by that evidence path, not by a canned count, fixture replay, or a pre-disclosed Skill oracle. If Codex cannot establish the path, it should state the proof gap rather than invent a finding.

## Two surfaces, two honest promises

| | Keyless `$deadbolt` Skill | API-backed TypeScript engine |
| --- | --- | --- |
| Authentication | Signed-in Codex model access | `OPENAI_API_KEY` |
| Main purpose | Read-only source-code reasoning audit | Threat model, four hunts, patch planning, and patched-code re-analysis |
| Runs `src/lib/analysis` | No | Yes |
| Patch/re-analysis claim | Never; reports recommendations and `not_run` statuses | Only when a live API run returns complete evidence |
| InvoicePilot judge path | Ready to run keylessly in Codex | Requires an API key; live behavior remains unverified here |
| Network boundary | Local-code-only judge path | Source intake only; staging access requires separate explicit authorization and an allowlist |

The repo-scoped `.agents/skills/deadbolt` copy mirrors the packaged Skill so a local Codex project can also discover it. The installable plugin above is the judge-facing distribution path.

## Run the API-backed engine locally

The web app is the full product surface, not the keyless demo path.

```bash
npm install
cp .env.example .env.local
# Add OPENAI_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000/analyze](http://localhost:3000/analyze), select a repository folder you own, confirm authorization, and choose **Run API-backed security loop**. Without `OPENAI_API_KEY`, uploaded-source analysis returns an honest unavailable response; it does not silently fall back to the fixture or to the Codex account running the browser.

The public site is [deadbolt-build-week.vercel.app](https://deadbolt-build-week.vercel.app). Its internal deterministic fixture is gated behind `DEADBOLT_INTERNAL_DEMO=1` and is not the public demo, the keyless Skill, or proof of a live API request.

### Engine design

```text
owner-supplied source
        ↓
threat model → evidence reduction → four independent hunt lenses
        ↓
plain-English findings + exact source evidence
        ↓
focused patch plans applied only to an isolated in-memory clone
        ↓
affected hunt re-analysis → root cause remains, clears, or is inconclusive
```

The engine requests GPT-5.6 Sol for threat modeling, hunt reasoning, patch planning, and affected-hunt re-analysis; it uses GPT-5.6 Terra for bounded evidence reduction. Its schemas are Zod-backed Structured Outputs, and a re-analysis is explicitly not described as executing tests.

## What is proven, and what is not

### Proven in this submission

- The `$deadbolt` workflow is packaged as an installable plugin and its local installation was exercised in an isolated Codex home.
- The packaged Skill now has a blind-audit boundary: it defers the sample manifest, seed verifiers, and answer-bearing documentation until after a report. Judges can independently compare its source evidence with the checklist above.
- The API engine’s implementation, fixture boundary, re-analysis safeguards, upload handling, and UI wording are locally build-validated.

### Intentionally not claimed

- A live GPT-5.6 API hunt, patch, or re-analysis has **not** been run without `OPENAI_API_KEY`; it remains pending a real key-backed run.
- The keyless Skill does **not** run `src/lib/analysis`, apply patches, execute tests, or return a red-to-green verification verdict.
- The internal deterministic fixture is development evidence only. Its seeded results do not prove a live model call or an unseen-repository result.
- No third-party host is probed. Deadbolt is for code and deployments the user owns or is explicitly authorized to audit.

## InvoicePilot sample

[`samples/invoice-pilot`](./samples/invoice-pilot) is deliberately vulnerable and entirely synthetic: its people, tenants, invoices, credentials, and payments are fictional. It is input for the two surfaces above, never a target to deploy as production software.

For its local app checks:

```bash
cd samples/invoice-pilot
npm install
npm run check
```

The sample’s explicit ground truth is in [`VULNERABILITY_MANIFEST.json`](./samples/invoice-pilot/VULNERABILITY_MANIFEST.json).

## How Codex and GPT-5.6 accelerated the build

Codex was used as the engineering environment for the work behind this submission: reading the repo’s `AGENTS.md`, coordinating independent security lenses, implementing focused changes, reviewing false-success paths, packaging the plugin, and repeatedly running lint, type checks, and production builds. The dated evidence trail is in [`BUILD_LOG.md`](./BUILD_LOG.md).

The API engine follows the OpenAI Responses API model/tool pattern and uses Structured Outputs to constrain its report contracts. GPT-5.6 Sol supports the Responses API, Structured Outputs, function calling, and prompt caching; those capabilities informed the engine design, but the live API behavior is still clearly marked pending. See OpenAI’s [GPT-5.6 Sol model page](https://developers.openai.com/api/docs/models/gpt-5.6-sol), [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs), and [Codex plugin packaging guide](https://learn.chatgpt.com/docs/build-plugins#plugin-structure).

## Supported platforms

- **Keyless Skill:** any Codex client that supports local plugins and Skills. The local marketplace installation was tested with Codex CLI on macOS; client availability and account model access are controlled by the Codex client.
- **API app:** Node.js 20.9+ with npm on a platform supported by Next.js. The project is locally validated with `npm run lint`, `npm run typecheck`, and `npm run build`.

## Safety boundary

- Audit only repositories and deployments you own or are authorized to test.
- Do not probe third-party systems or generate reusable exploit payloads.
- Prefer tight file/line evidence and plain-English impact over a raw finding count.
- Do not call a patch applied, a root cause cleared, or a test passed without the evidence that actually supports that status.
