# Deadbolt

> Working name. An autonomous blue-team security agent for apps you own.

Deadbolt is being built for solo builders who can ship an application faster than they can become security experts. Its core loop will threat-model a repository, hunt for vulnerabilities that require real code reasoning, explain the human impact, write focused patches, and re-test the result.

## Current milestone

**M2 — Core analysis, staged:** Deadbolt now accepts a bounded repository
snapshot, builds a threat model, reduces evidence, runs four specialized hunt
contracts, and returns strict structured findings.

InvoicePilot exercises the full contract through a deterministic fixture with
eight verified findings and one intentional clean injection pass. The live
GPT-5.6 Sol provider, Structured Outputs, Programmatic Tool Calling, prompt-cache
measurement, and retry boundary are implemented but still require an
`OPENAI_API_KEY` for live validation. M2 remains staged—not complete—until that
gate is passed.

Patches and re-tests remain deliberately gated for M4–M5.

## Live foundation

https://deadbolt-build-week.vercel.app

## Live seeded demo

https://invoicepilot-deadbolt-demo.vercel.app

InvoicePilot contains only fictional people, companies, invoices, credentials,
and payments. Its eight planted vulnerabilities are documented and
programmatically verified in `samples/invoice-pilot`.

## Safety boundary

- Audit only repositories and deployments you own or are authorized to test.
- Produce findings, evidence, plain-English impact, and defensive patches.
- Do not probe third-party targets or generate turnkey exploit tooling.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The InvoicePilot fixture works without credentials. To analyze uploaded source
files with the live provider, set `OPENAI_API_KEY` locally and leave
`DEADBOLT_ANALYSIS_MODE` unset. Set `DEADBOLT_ANALYSIS_MODE=fixture` to force the
deterministic demo path.

## Validate

```bash
npm run check
```

## Build evidence

See [BUILD_LOG.md](./BUILD_LOG.md) for dated Codex/GPT-5.6 decisions, techniques, milestone proof, and validation results.
