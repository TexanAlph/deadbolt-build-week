# Deadbolt

> Working name. An autonomous blue-team security agent for apps you own.

Deadbolt is being built for solo builders who can ship an application faster than they can become security experts. Its core loop will threat-model a repository, hunt for vulnerabilities that require real code reasoning, explain the human impact, write focused patches, and re-test the result.

## Current milestone

**M1 — Seeded demo app:** InvoicePilot is a realistic, deliberately vulnerable
SaaS with eight synthetic security flaws and its own live Vercel deployment.

The Deadbolt analysis engine, reports, patches, and re-test loop are deliberately
not represented as working yet. Each milestone must be shown working before the
next one starts.

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

## Validate

```bash
npm run check
```

## Build evidence

See [BUILD_LOG.md](./BUILD_LOG.md) for dated Codex/GPT-5.6 decisions, techniques, milestone proof, and validation results.
