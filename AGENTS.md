# Deadbolt

Build a product-grade autonomous blue-team agent for people auditing repositories and staging deployments they own.

## Intent

- Keep the core loop visible: threat-model → hunt → patch → re-test.
- Explain findings in plain English and human stakes; security jargon is secondary.
- Self-audit only. Never probe third-party targets or generate turnkey exploit tooling.
- Keep all model access behind one provider boundary. Use GPT-5.6 Sol through the Responses API for the hardest reasoning and structured outputs.
- Honor milestone gates. Show the current milestone working before starting the next one.

## Working agreement

- This is Next.js 16. Read the relevant guide in `node_modules/next/dist/docs/` before using framework APIs.
- Keep changes focused and preserve the mobile experience.
- For M2, explicitly delegate independent hunt passes for secrets, auth/IDOR, injection, and config/CORS/headers, then distill the evidence in the main thread.
- Log material Codex/model work and validation evidence in `BUILD_LOG.md`.
- After changes, run `npm run lint`, `npm run typecheck`, and `npm run build`. Repair failures before stopping.
