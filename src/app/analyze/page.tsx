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
          <p>FULL LOOP · READY</p>
          <span>SELF-AUDIT ONLY</span>
        </div>
      </header>

      <section className="analysis-intro">
        <div>
          <p className="eyebrow">INVOICEPILOT IS READY TO SCAN</p>
          <h1>
            Find the bug.
            <span>Fix it. Prove it.</span>
          </h1>
        </div>
        <p>
          Start with the synthetic InvoicePilot sample: confirm the ownership
          box, press the green scan button, and Deadbolt will map, hunt, patch,
          and re-test all eight known risks. Or switch to your own source files.
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
