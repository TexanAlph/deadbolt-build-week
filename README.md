# Deadbolt

Deadbolt has two deliberately separate surfaces for auditing repositories you own:

1. **`$deadbolt` Codex Skill — primary judge path.** A keyless, source-code reasoning audit that produces evidence-backed findings. It runs with a signed-in Codex client and does **not** require `OPENAI_API_KEY`.
2. **API-backed TypeScript engine — secondary product path.** The Next.js app in `src/lib/analysis` implements threat model → hunt → patch → re-analysis through the OpenAI Responses API. It requires `OPENAI_API_KEY` and has not yet been verified with a live API run in this submission.

The distinction is intentional. The Skill is not a disguised fixture and does not claim that it runs the TypeScript engine’s patch-and-re-analysis loop.

## Test it yourself: keyless `$deadbolt` audit

This is the primary judge path. It is a read-only Codex Skill that reasons over
local source code; it is **not** the API-backed TypeScript engine and it does
not patch code or run tests.

### Fastest path: two conversational prompts

1. **Install:** Tell Codex: “Use the built-in Skill Installer to install the Deadbolt Skill from https://github.com/TexanAlph/deadbolt-build-week/tree/main/.agents/skills/deadbolt.”
2. **Run:** In a new Codex task opened at a clone of this repository, tell Codex: “Use the installed Deadbolt security-audit Skill to audit the local `samples/invoice-pilot` repository I own for security vulnerabilities. Work read-only and cite file-and-line evidence.”

The installer downloads the Skill, not InvoicePilot itself, so the second line
still needs this repository open locally. Codex may ask for permission to
download the public GitHub source. No `OPENAI_API_KEY` is needed.

### Before you begin

You need only:

- a signed-in Codex desktop app or Codex CLI with model access; and
- Git.

You do **not** need Node.js, `npm install`, an `.env` file, or an
`OPENAI_API_KEY`. You also do **not** need to run `codex --enable skills`.
In the current Codex CLI, plugins are a stable feature and an installed
plugin's bundled Skills become available in a **new** Codex task or CLI session.

If you are using the CLI, confirm that Codex is installed and signed in:

```bash
codex --version
codex login
```

If `codex login` says you are already signed in, continue.

### 1. Download Deadbolt and install the packaged Skill

Copy and run these commands in a terminal, one block at a time:

```bash
git clone https://github.com/TexanAlph/deadbolt-build-week.git
cd deadbolt-build-week
```

```bash
codex plugin marketplace add "$PWD/codex-plugin"
codex plugin add deadbolt@deadbolt-build-week
codex plugin list --available --json
```

The last command should show `deadbolt@deadbolt-build-week` as `installed` and
`enabled`. This is the tested cold-install route for this repository: the
marketplace is at `codex-plugin/.agents/plugins/marketplace.json`, its plugin
is at `codex-plugin/plugins/deadbolt/`, and it bundles the `$deadbolt` Skill.
The repo's `.agents/skills/deadbolt/` folder is an identical project-local
mirror, not a second product to install. Do not use a fixture, an API key, or
the web app for this walkthrough.

### 2. Start a fresh Codex task and run the audit

The installation takes effect only in a new task or CLI session.

**Codex CLI:** while still inside the cloned `deadbolt-build-week` directory,
run this one command exactly:

```bash
codex -C "$PWD" '$deadbolt Audit only the code I own in samples/invoice-pilot. Work read-only: build a threat model, inspect authorization end-to-end, and report only evidence-backed findings with file/line evidence. Do not make network requests or edit files. Before reporting, do not inspect README files, VULNERABILITY_MANIFEST.json, BUILD_LOG.md, or seed/verification scripts.'
```

**Codex desktop app:** open the cloned `deadbolt-build-week` folder, start a
new task, and paste the same text beginning with `$deadbolt` into the message
box. The target is the local sample folder `samples/invoice-pilot` inside this
clone—not the deployed website and not a third-party repository.

### 3. What a successful audit looks like

Let the audit finish before comparing it with this checklist. The prompt and
the Skill deliberately keep the answer-bearing README, manifest, and seed
verifiers out of the model's audit context.

The report should identify an evidence-backed **IDOR/BOLA authorization risk**:
a person who controls an invoice ID can reach another tenant's invoice because
the request path does not establish a session or enforce invoice ownership. It
should support that conclusion with tight file/line evidence, including the
API route at
[`samples/invoice-pilot/src/app/api/invoices/[id]/route.ts`](./samples/invoice-pilot/src/app/api/invoices/[id]/route.ts),
the `ownerId`-bearing lookup in
[`samples/invoice-pilot/src/lib/data.ts`](./samples/invoice-pilot/src/lib/data.ts),
and the repeated lookup in
[`samples/invoice-pilot/src/app/invoice/[id]/page.tsx`](./samples/invoice-pilot/src/app/invoice/[id]/page.tsx).

Judge it by the explanation and cited source path—not by a canned finding
count. The audit is allowed to report a proof gap when it cannot establish the
path; it must not invent a result, claim a patch was applied, or claim a test
ran.

### Keyless means no API key

This path does **not** call `src/lib/analysis` or that engine's configured
OpenAI API provider, and it does not run the TypeScript engine's hunt → patch
→ re-analysis loop. It uses the model access already provided by the judge's
signed-in Codex client. No `OPENAI_API_KEY` is needed or requested; being
signed in to Codex with model access is still required.

### If you get stuck

1. **`$deadbolt` is not recognized.** Run
   `codex plugin list --available --json` from the clone and confirm that the
   plugin is both installed and enabled. Then close the current task/session
   and start a new one; bundled Skills are discovered only in new sessions. If
   the `codex plugin` command itself is missing, update the Codex desktop app
   or CLI first—there is no separate `--enable skills` switch to add.

2. **Codex says it cannot find `samples/invoice-pilot`.** The task was started
   in the wrong folder. In a terminal, run `cd deadbolt-build-week` and
   `ls samples/invoice-pilot`, then start the fresh task from that directory.
   Keep the sample path in the prompt exactly as written.

3. **You are asked for an API key or see a patch/test claim.** Stop and start a
   new task with the exact `$deadbolt` prompt above. The keyless Skill is
   audit-only and needs no `.env` or `OPENAI_API_KEY`; the API-backed web app is
   a separate, intentionally key-required surface.

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
npm run prepare:live-sample
npm run dev
```

Open [http://localhost:3000/analyze](http://localhost:3000/analyze), select the generated `work/invoice-pilot-live-input` folder (or another repository you own), confirm authorization, and choose **Run API-backed security loop**. The preparation command intentionally omits InvoicePilot's answer-bearing README, manifest, and seed scripts, so the live model receives ordinary application source rather than its expected result. Without `OPENAI_API_KEY`, uploaded-source analysis returns an honest unavailable response; it does not silently fall back to the fixture or to the Codex account running the browser.

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
