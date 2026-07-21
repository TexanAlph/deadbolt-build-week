# Deadbolt — Devpost Submission Kit

## Project details

- **Name:** Deadbolt
- **Tagline:** Keyless, evidence-backed security audits for repositories you own.
- **Category:** Developer Tools
- **Live site:** https://deadbolt-build-week.vercel.app
- **Source:** https://github.com/TexanAlph/deadbolt-build-week
- **Built with:** GPT-5.6, Codex, Next.js, TypeScript, the OpenAI Responses API, Zod, and Vercel
- **Codex `/feedback` Session ID:** `019f7211-fea5-7652-bde6-777f5694ee1b`

## Paste-ready project description

Vibe-coded products can ship quickly, but solo builders rarely get the security review loop that established engineering teams rely on. Deadbolt is a defensive blue-team product for source repositories a user owns or is explicitly authorized to audit. It turns a vague request—“is this secure?”—into a structured workflow: threat model the code, hunt through independent security lenses, attach evidence and human stakes to each finding, recommend a focused fix, and state exactly what was or was not verified.

The primary, judge-testable surface is the keyless `$deadbolt` Codex Skill. A signed-in Codex user can install the bundled plugin and ask it to audit local source code without a separate API key. The Skill is intentionally read-only: it builds a compact threat model, examines secrets, authorization/IDOR, input-to-sink, and configuration risks, and returns only evidence-backed findings with precise source locations. When a user asks for a fix, it supplies remediation recommendations without pretending it edited code or verified a patch.

Deadbolt also includes a separate Next.js TypeScript engine that models the fuller hunt → patch → re-analysis product workflow through the OpenAI Responses API and structured outputs. It applies focused patch plans only to an isolated in-memory clone and re-runs the affected hunt lens against that clone. This submission is deliberately precise: the web engine requires an API key, and no live key-backed run is represented as verified. The keyless Skill does not claim to be that engine.

Codex drove the product engineering: the plugin package, security-lens architecture, source-intake controls, report contracts, patch safeguards, and verification suite. GPT-5.6 informs the model-backed engine design and authorship workflow. The repository includes an intentionally vulnerable synthetic sample, a blind-audit prompt that prevents the model from reading its answer key, a public installation walkthrough, and a complete validation trail.

## Judge testing instructions

1. Clone https://github.com/TexanAlph/deadbolt-build-week.
2. From the repository root, install the bundled plugin:

   ```bash
   codex plugin marketplace add "$PWD/codex-plugin"
   codex plugin add deadbolt@deadbolt-build-week
   ```

3. Start a **new** Codex task in that clone and run:

   ```text
   $deadbolt Audit only the code I own in samples/invoice-pilot. Work read-only: build a threat model, inspect authorization end-to-end, and report only evidence-backed findings with file/line evidence. Do not make network requests or edit files. Before reporting, do not inspect README files, VULNERABILITY_MANIFEST.json, BUILD_LOG.md, or seed/verification scripts.
   ```

4. The report should identify the cross-tenant invoice authorization risk with source evidence. It must not claim a patch was applied or a test was run.

The public site is a companion product page. Its API-backed web loop is intentionally disabled without a configured provider; the `$deadbolt` Skill above is the primary no-key judge path.

## Video outline (2 minutes 35 seconds)

| Time | Show | Narration beat |
| --- | --- | --- |
| 0:00–0:15 | Deadbolt home | Solo builders can ship quickly without a security team; Deadbolt turns a plain-English audit request into evidence, not generic advice. |
| 0:15–0:35 | Plugin install commands | The primary path is a keyless Codex Skill—no separate API key or backend setup is needed. |
| 0:35–1:20 | Fresh Codex task and exact blind-audit prompt | The Skill reads only owned local source, creates a threat model, and uses four security lenses. The prompt deliberately hides the sample’s answer key. |
| 1:20–1:50 | Evidence-backed IDOR/BOLA result with file/line references | Show the finding, plain-English human impact, and the exact source evidence that connects an invoice ID to missing ownership checks. |
| 1:50–2:15 | Code, validation output, and the report design | Show how Codex built the plugin and product, then show the complete lint, typecheck, report, live-verifier, and production-build results. |
| 2:15–2:35 | Home core-loop section | The API-backed engine is the future hunt → patch → re-analysis surface; the entry is honest that the live key-backed engine is not the keyless Skill. |

## Remaining Devpost fields

- **Public YouTube video URL:** required before final submission.
- **Submitter type and country of residence:** enter your legal details exactly.
- **Category:** choose `Developer Tools`.
- **Repository:** enter the public GitHub URL above.
- **Judge test link/instructions:** paste the Judge testing instructions above.
