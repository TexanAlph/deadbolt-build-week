# Deadbolt report contract

Use one record per distinct security root cause.

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
| `remediationPlan` | Smallest control change that restores the invariant. |
| `patchDiff` | Reviewable diff, or `null` when none was generated. |
| `patchStatus` | `not_generated`, `generated`, or `applied_to_sandbox`. Use an accurate equivalent when applied to the authorized working tree. |
| `retestStatus` | `not_run`, `passed`, or `failed`. |
| `retestEvidence` | Command, assertion, or source invariant proving the status. |

## Severity calibration

- `critical`: direct exposure of high-value data, credentials, or privileged
  actions with little friction.
- `high`: credible abuse path with material impact.
- `medium`: meaningful guardrail failure that increases exposure or future
  exploitability.
- `low`: narrow hardening opportunity with limited present impact.
- `informational`: useful security context with no confirmed weakness.

## Completion rule

A finding is complete only when its patch was applied within the authorized
boundary and its original invariant re-tested green. Otherwise keep the proof
gap visible.
