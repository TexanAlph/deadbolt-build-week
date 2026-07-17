import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisConsole } from "@/components/analysis-console";

export const metadata: Metadata = {
  title: "Core analysis",
  description:
    "Run Deadbolt's bounded repository intake and structured blue-team analysis core.",
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
          <p>CORE ENGINE · STAGED</p>
          <span>SELF-AUDIT ONLY</span>
        </div>
      </header>

      <section className="analysis-intro">
        <div>
          <p className="eyebrow">REPOSITORY → STRUCTURED FINDINGS</p>
          <h1>
            Give the hunt
            <span>something real to reason about.</span>
          </h1>
        </div>
        <p>
          Deadbolt maps the application first, reduces source evidence in a
          bounded stage, then runs four independent vulnerability hunts. This
          milestone stops at structured findings—patches and re-tests come
          next.
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
