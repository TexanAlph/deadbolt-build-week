import type { AnalysisReport, Finding } from "@/lib/analysis/schemas";

export type FindingSeverity = Finding["severity"];
export type ReportFilter = "all" | FindingSeverity;

export const severityOrder: FindingSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
];

export const severityGuidance: Record<FindingSeverity, string> = {
  critical: "Fix before anyone else uses this app",
  high: "A real abuse path is open",
  medium: "A security guardrail is missing",
  low: "Hardening would reduce future risk",
  informational: "Useful security context",
};

export function severityCounts(findings: Finding[]) {
  return Object.fromEntries(
    severityOrder.map((severity) => [
      severity,
      findings.filter((finding) => finding.severity === severity).length,
    ]),
  ) as Record<FindingSeverity, number>;
}

export function chooseLeadFinding(findings: Finding[]) {
  return (
    findings.find((finding) => finding.category === "idor-bola") ??
    [...findings].sort(
      (a, b) =>
        severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
    )[0]
  );
}

export function reportVerdict(report: AnalysisReport) {
  const counts = severityCounts(report.findings);
  const passed = report.findings.filter(
    (finding) => finding.retestStatus === "passed",
  ).length;
  const failed = report.findings.filter(
    (finding) => finding.retestStatus === "failed",
  ).length;

  if (
    report.findings.length > 0 &&
    passed === report.findings.length &&
    failed === 0
  ) {
    if (report.engine.liveModel) {
      return {
        label: "PATCHED + RE-ANALYZED",
        headline: `${report.findings.length} risks found. ${passed} original root causes cleared by fresh hunt re-analysis.`,
        summary:
          "Every patch was applied to an isolated repository clone, then the affected hunt lens ran again against the patched source. No executable tests were run.",
      };
    }

    return {
      label: "PATCHED + INVARIANTS GREEN",
      headline: `${report.findings.length} fixture risks found. ${passed} deterministic source invariants green.`,
      summary:
        "Every fixture patch was applied to an isolated repository clone, then checked with a deterministic source invariant. No executable tests were run.",
    };
  }

  if (counts.critical > 0) {
    return {
      label: "NOT READY TO SHIP",
      headline: `${report.findings.length} confirmed risks could expose data, access, or trust.`,
      summary: `${counts.critical} need attention before this app is shared with real customers.`,
    };
  }

  if (counts.high > 0) {
    return {
      label: "NEEDS ATTENTION",
      headline: `${report.findings.length} confirmed risks need a decision before launch.`,
      summary: `${counts.high} have a credible abuse path.`,
    };
  }

  return {
    label: "REVIEW COMPLETE",
    headline: `${report.findings.length} security observations are ready to review.`,
    summary: "No critical or high-severity finding was confirmed.",
  };
}

export function humanizeHuntClass(huntClass: Finding["huntClass"]) {
  const labels: Record<Finding["huntClass"], string> = {
    secrets: "Secrets",
    auth_idor: "Access + ownership",
    injection: "Injection",
    config: "Configuration",
  };

  return labels[huntClass];
}
