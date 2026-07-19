# Deadbolt keyless-audit report contract

Use one record per distinct security root cause. This contract is for the
keyless Codex audit Skill, not the API-backed TypeScript engine.

## Required finding fields

| Field | Meaning |
| --- | --- |
| `id` | Stable local identifier. |
| `huntClass` | `secrets`, `auth_idor`, `injection`, or `config`. |
| `category` | Precise weakness category such as `idor-bola`. |
| `severity` | `critical`, `high`, `medium`, `low`, or `informational`. |
| `confidence` | Evidence confidence from 0 to 1. |
| `title` | Short outcome-oriented title. |
| `file`, `line` | Primary source location. |
| `evidence` | Tight source ranges and why each range matters. |
| `plainEnglish` | Human impact without security jargon. |
| `exploitInPlainTerms` | Conceptual abuse path, never a turnkey payload. |
| `remediationPlan` | Smallest recommended control change that restores the invariant. |
| `patchDiff` | Always `null` for this audit-only Skill. |
| `patchStatus` | `not_run`; this Skill does not patch. |
| `retestStatus` | `not_run`; this Skill does not execute the engine re-analysis loop. |
| `retestEvidence` | State the proof gap or read-only code evidence. |

## Severity calibration

- `critical`: direct exposure of high-value data, credentials, or privileged
  actions with little friction.
- `high`: credible abuse path with material impact.
- `medium`: meaningful guardrail failure that increases exposure or future
  exploitability.
- `low`: narrow hardening opportunity with limited present impact.
- `informational`: useful security context with no confirmed weakness.

## Completion rule

An audit finding is complete only when its evidence and recommendation are
clear. Do not label it fixed, patched, tested, or verified. Those claims belong
only to separately performed, documented remediation work.
