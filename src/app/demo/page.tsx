import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportExperience } from "@/components/report-experience";
import { runFixtureAnalysis } from "@/lib/analysis/fixture-provider";
import { loadDemoRepository } from "@/lib/analysis/repository";

export const metadata: Metadata = {
  title: "Internal security fixture",
  description:
    "A private deterministic fixture for Deadbolt development and validation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DemoPage() {
  if (process.env.DEADBOLT_INTERNAL_DEMO !== "1") {
    notFound();
  }

  const repository = await loadDemoRepository();
  const report = runFixtureAnalysis(
    repository,
    "db_internal_fixture",
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
          <p className="eyebrow">INTERNAL FIXTURE · PRE-RUN REPORT</p>
          <h1>
            Eight risks in.
            <span>Eight source invariants green.</span>
          </h1>
        </div>
        <p>
          No signup, API key, GitHub admin, CodeQL, or CI required. This
          deterministic run preserves the full finding evidence, applies each
          exact patch to an isolated clone, and checks deterministic source
          invariants. It does not execute tests.
        </p>
      </section>

      <ReportExperience report={report} />
    </main>
  );
}
