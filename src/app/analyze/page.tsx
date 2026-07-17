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
          <p>M3 · REPORT READY</p>
          <span>SELF-AUDIT ONLY</span>
        </div>
      </header>

      <section className="analysis-intro">
        <div>
          <p className="eyebrow">REPOSITORY → HUMAN STAKES</p>
          <h1>
            Find the bug.
            <span>Understand the damage.</span>
          </h1>
        </div>
        <p>
          Deadbolt maps the application first, reduces source evidence in a
          bounded stage, then turns four independent vulnerability hunts into a
          report a solo builder can actually act on. Patches and re-tests still
          come next.
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
