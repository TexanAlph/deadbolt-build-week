import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisConsole } from "@/components/analysis-console";

export const metadata: Metadata = {
  title: "Security report",
  description:
    "Run Deadbolt and review a plain-English security report with human stakes and linked source evidence.",
};

export default function AnalyzePage() {
  return (
    <main className="analysis-page">
      <header className="analysis-header">
        <Link className="brand" href="/" aria-label="Deadbolt home">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <span className="brand-name">DEADBOLT</span>
        </Link>
        <div className="analysis-header-copy">
          <p>API-BACKED FULL LOOP</p>
          <span>SELF-AUDIT ONLY</span>
        </div>
      </header>

      <section className="analysis-intro">
        <div>
          <p className="eyebrow">SOURCE-ONLY · SELF-AUDIT</p>
          <h1>
            Find the bug.
            <span>Patch it. Re-analyze it.</span>
          </h1>
        </div>
        <p>
          Add source files from an application you own, confirm authorization,
          and the API-backed Deadbolt engine can map the trust boundaries, run
          four focused hunts, prepare reviewable patches, and rerun each
          affected hunt against the patched clone. It requires a configured
          provider; the keyless <code>$deadbolt</code> Codex Skill is a
          separate read-only audit and does not run this loop.
        </p>
      </section>

      <AnalysisConsole />

      <section className="analysis-guardrail">
        <p>DEFENSIVE BOUNDARY</p>
        <span>
          Source code only. No third-party probing. No exploit payloads.
        </span>
      </section>
    </main>
  );
}
