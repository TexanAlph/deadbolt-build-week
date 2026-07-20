# Deadbolt Codex Plugin

This package installs the `$deadbolt` Skill: a keyless, evidence-backed source-code audit for a repository you own.

It is deliberately distinct from Deadbolt's web application's API-backed TypeScript engine. The installed Skill uses the Codex agent to read and reason about code; it does **not** invoke the TypeScript engine, generate engine patches, or perform the engine's patch → re-analysis loop.

If someone asks Deadbolt to “fix” or “patch” security issues, the Skill still
activates: it audits the repository, reports evidence, and recommends fixes.
It remains read-only and explicitly says that it did not apply or verify a
patch.

## Install from this repository

From a local checkout of this repository:

```bash
codex plugin marketplace add /absolute/path/to/deadbolt-build-week/codex-plugin
codex plugin add deadbolt@deadbolt-build-week
```

Start a **new** Codex task in the repository after installation so Codex loads the Skill.

For the end-to-end keyless sample, follow `skills/deadbolt/SKILL.md` and point the Skill at `samples/invoice-pilot`.

## Keyless requirement

No `OPENAI_API_KEY` is needed for the Skill. It requires a signed-in Codex client with model access, so it is not an offline scanner.

## Supported clients

The package contains no native code. Use it in a Codex client where local plugins and Skills are enabled (Codex desktop app, Codex CLI, or an IDE client with the same plugin support). Platform availability follows that Codex client.
