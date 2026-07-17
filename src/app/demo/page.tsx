import type { Metadata } from "next";
import Link from "next/link";
import { ReportExperience } from "@/components/report-experience";
import { runFixtureAnalysis } from "@/lib/analysis/fixture-provider";
import { loadDemoRepository } from "@/lib/analysis/repository";

export const metadata: Metadata = {
  title: "One-click InvoicePilot demo",
  description:
    "Open Deadbolt’s complete, pre-run InvoicePilot hunt, patch, and re-test report.",
};

export default async function DemoPage() {
  const repository = await loadDemoRepository();
  const report = runFixtureAnalysis(
    repository,
    "db_demo_invoicepilot",
    1482,
  );

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
          <p>ONE-CLICK DEMO · COMPLETE</p>
          <span>SELF-AUDIT ONLY</span>
        </div>
      </header>

      <section className="demo-intro">
        <div>
          <p className="eyebrow">INVOICEPILOT · PRE-RUN REPORT</p>
          <h1>
            Eight risks in.
            <span>Eight verified fixes out.</span>
          </h1>
        </div>
        <p>
          No signup, API key, GitHub admin, CodeQL, or CI required. This
          deterministic run preserves the full finding evidence, applies each
          exact patch to an isolated clone, and proves the red → green change.
        </p>
      </section>

      <ReportExperience report={report} />
    </main>
  );
}
