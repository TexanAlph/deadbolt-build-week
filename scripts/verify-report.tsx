import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { AnalysisConsole } from "../src/components/analysis-console";
import { ReportExperience } from "../src/components/report-experience";
import { runFixtureAnalysis } from "../src/lib/analysis/fixture-provider";
import { loadDemoRepository } from "../src/lib/analysis/repository";

async function main() {
  const intakeHtml = renderToStaticMarkup(<AnalysisConsole />);
  assert.match(intakeHtml, /webkitdirectory=""/);
  assert.match(intakeHtml, /Choose repository folder/);

  const repository = await loadDemoRepository();
  const report = runFixtureAnalysis(repository, "db_report_verifier", 12);
  const html = renderToStaticMarkup(
    <ReportExperience report={report} onStartOver={() => undefined} />,
  );

  assert.match(html, /ANALYSIS REPORT · REVIEWABLE EVIDENCE/);
  assert.match(html, /PATCHED \+ INVARIANTS GREEN/);
  assert.match(
    html,
    /8 fixture risks found\. 8 deterministic source invariants green/,
  );
  assert.match(
    html,
    /Changing an invoice number reveals another customer’s invoice/,
  );
  assert.match(html, /BEFORE PATCH/);
  assert.match(html, /AFTER PATCH/);
  assert.match(html, /REVIEWABLE PATCH/);
  assert.match(html, /INVARIANT CHECK PASSED/);
  assert.match(html, /8 green/);
  assert.match(html, /No executable tests were run/);
  assert.match(html, /Focused fix applied/);
  assert.match(html, /FULL LOOP COMPLETE/);
  assert.match(html, /Four independent security lenses/);
  assert.match(html, /A clean pass is reported as evidence too/);
  assert.doesNotMatch(html, /OPTIONAL DEPTH · OWNED STAGING/);
  assert.doesNotMatch(html, /RE-TEST/);

  const liveReport = {
    ...report,
    engine: {
      ...report.engine,
      provider: "openai" as const,
      model: "gpt-5.6-sol",
      liveModel: true,
      reasoningEffort: "max" as const,
    },
  };
  const liveHtml = renderToStaticMarkup(
    <ReportExperience report={liveReport} />,
  );
  assert.match(liveHtml, /PATCHED \+ RE-ANALYZED/);
  assert.match(liveHtml, /HUNT RE-ANALYSIS PASSED/);
  assert.match(liveHtml, /original root causes cleared/);
  assert.match(liveHtml, /No executable tests were run/);

  const incompleteReport = {
    ...liveReport,
    findings: liveReport.findings.map((finding) =>
      finding.id === "IP-003"
        ? {
            ...finding,
            patchStatus: "generated" as const,
            retestStatus: "not_run" as const,
            retestEvidence:
              "The proposed patch did not apply cleanly, so re-analysis did not run.",
          }
        : finding,
    ),
    remediation: {
      ...liveReport.remediation,
      patchesApplied: liveReport.remediation.patchesApplied - 1,
      retestsPassed: liveReport.remediation.retestsPassed - 1,
    },
  };
  const incompleteHtml = renderToStaticMarkup(
    <ReportExperience report={incompleteReport} />,
  );
  assert.match(incompleteHtml, /Patch proposed, not applied/);
  assert.match(incompleteHtml, /REMEDIATION INCOMPLETE/);
  assert.match(incompleteHtml, /7\/8 PATCHES APPLIED/);
  assert.doesNotMatch(incompleteHtml, /Focused fix applied/);
  assert.doesNotMatch(incompleteHtml, /FULL LOOP COMPLETE/);
  assert.doesNotMatch(incompleteHtml, /verdict-status verified/);
  assert.doesNotMatch(
    incompleteHtml,
    /applied this exact diff to an isolated in-memory clone/,
  );

  const failedReport = {
    ...liveReport,
    findings: liveReport.findings.map((finding) =>
      finding.id === "IP-003"
        ? {
            ...finding,
            retestStatus: "failed" as const,
            retestEvidence:
              "Fresh re-analysis still found the original ownership failure.",
          }
        : finding,
    ),
    remediation: {
      ...liveReport.remediation,
      retestsPassed: liveReport.remediation.retestsPassed - 1,
      retestsFailed: 1,
    },
  };
  const failedHtml = renderToStaticMarkup(
    <ReportExperience report={failedReport} />,
  );
  assert.match(failedHtml, /Patch applied; issue remains/);
  assert.match(failedHtml, /Root cause not cleared/);
  assert.match(failedHtml, /REMEDIATION INCOMPLETE/);
  assert.doesNotMatch(failedHtml, /Focused fix applied/);
  assert.doesNotMatch(failedHtml, /FULL LOOP COMPLETE/);

  const cleanReport = {
    ...liveReport,
    findings: [],
    passes: liveReport.passes.map((pass) => ({
      ...pass,
      findings: [],
      noFindingReason:
        pass.noFindingReason ??
        `The completed ${pass.huntClass} hunt returned no evidence-backed finding.`,
      verificationResults: [],
    })),
    coverage: {
      ...liveReport.coverage,
      cleanClasses: [...liveReport.coverage.completedClasses],
    },
    remediation: {
      ...liveReport.remediation,
      patchesGenerated: 0,
      patchesApplied: 0,
      retestsPassed: 0,
      retestsFailed: 0,
    },
  };
  const cleanHtml = renderToStaticMarkup(
    <ReportExperience report={cleanReport} />,
  );
  assert.match(cleanHtml, /NO VULNERABILITIES FOUND/);
  assert.match(cleanHtml, /No vulnerabilities found in this scan/);
  assert.match(cleanHtml, /not a guarantee that the code has no vulnerabilities/);
  assert.match(cleanHtml, /0 FINDINGS · 0 PATCHES NEEDED/);
  assert.match(cleanHtml, /Four independent security lenses/);
  assert.doesNotMatch(cleanHtml, /FULL LOOP COMPLETE/);
  assert.doesNotMatch(cleanHtml, /Focused fix applied/);

  console.log(
    "✓ Final report verified: live hunt re-analysis and fixture invariant labels are distinct and honest",
  );
}

void main();
