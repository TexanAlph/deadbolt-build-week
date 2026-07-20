# Deadbolt — OpenAI Build Week submission

- **Track:** Developer Tools
- **Repository:** https://github.com/TexanAlph/deadbolt-build-week
- **Demo video:** _Add the public video URL before submitting._
- **Codex /feedback session ID:** 019f7211-fea5-7652-bde6-777f5694ee1b

## What it is

Deadbolt is a defensive, source-code security product for repositories a user
owns or is authorized to audit. It keeps the security loop visible:
threat-model → hunt → patch → re-analyze.

The submission has two deliberately separate surfaces:

1. **Primary judge path — keyless $deadbolt Codex Skill.** A read-only,
   evidence-backed source audit that runs with the judge's signed-in Codex model
   access. It needs no OPENAI_API_KEY.
2. **Secondary product path — API-backed TypeScript engine.** The Next.js
   engine in src/lib/analysis implements the full hunt → patch → re-analysis
   loop through the OpenAI Responses API. It requires a local OPENAI_API_KEY;
   no live API run is represented as verified here.

## How judges can test it

Follow the canonical cold-install guide in
[README.md](./README.md#test-it-yourself-keyless-deadbolt-audit):

1. Clone this repository and install the bundled deadbolt Codex plugin.
2. Start a new Codex task in the clone and run the documented $deadbolt
   read-only prompt against samples/invoice-pilot.
3. Confirm the evidence-backed IDOR/BOLA finding cites the invoice route and
   ownership-bearing lookup described in the guide.

The sample test is keyless: it needs a signed-in Codex client with model access,
not an OpenAI API key. The Skill is intentionally audit-only; it does not claim
to patch code, execute tests, or run the API-backed remediation loop.
