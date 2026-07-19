"use client";

import { useMemo, useState } from "react";
import type { AnalysisReport } from "@/lib/analysis/schemas";
import {
  chooseLeadFinding,
  humanizeHuntClass,
  reportVerdict,
  severityCounts,
  severityGuidance,
  type ReportFilter,
} from "@/lib/report/presentation";

interface ReportExperienceProps {
  report: AnalysisReport;
  onStartOver?: () => void;
}

const filters: Array<{ value: ReportFilter; label: string }> = [
  { value: "all", label: "All findings" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
];

export function ReportExperience({
  report,
  onStartOver,
}: ReportExperienceProps) {
  const leadFinding = chooseLeadFinding(report.findings);
  const [filter, setFilter] = useState<ReportFilter>("all");
  const [selectedFindingId, setSelectedFindingId] = useState(
    leadFinding?.id ?? report.findings[0]?.id ?? "",
  );
  const counts = useMemo(
    () => severityCounts(report.findings),
    [report.findings],
  );
  const verdict = useMemo(() => reportVerdict(report), [report]);
  const isLiveReanalysis = report.engine.liveModel;
  const openAfterVerification = report.findings.filter(
    (finding) => finding.retestStatus !== "passed",
  ).length;
  const allFindingsPassed =
    report.findings.length > 0 && openAfterVerification === 0;
  const allPatchesApplied =
    report.findings.length > 0 &&
    report.findings.every(
      (finding) => finding.patchStatus === "applied_to_sandbox",
    );
  const coverageComplete = report.coverage.requestedClasses.every((huntClass) =>
    report.coverage.completedClasses.includes(huntClass),
  );
  const verificationCopy = isLiveReanalysis
    ? {
        engine: "LIVE · GPT-5.6 SOL · HUNT RE-ANALYSIS",
        passedTotal: "cleared by re-analysis",
        open: "Open after re-analysis",
        stage: "Re-analysis",
        passedShort: "cleared",
        findingPassed: "✓ ROOT CAUSE CLEARED",
        passed: "Hunt re-analysis passed",
        incomplete: "Hunt re-analysis incomplete",
        proof: "HUNT RE-ANALYSIS",
        missing: "No hunt re-analysis evidence was returned.",
        comparison:
          "The source repository was never changed. Deadbolt applied this exact diff to an isolated in-memory clone, then ran the same affected hunt lens again. No executable tests were run.",
      }
    : {
        engine: "DETERMINISTIC FIXTURE · SOURCE INVARIANTS",
        passedTotal: "fixture invariants green",
        open: "Open after invariant check",
        stage: "Invariant check",
        passedShort: "green",
        findingPassed: "✓ FIXTURE INVARIANT GREEN",
        passed: "Fixture invariant passed",
        incomplete: "Fixture invariant incomplete",
        proof: "INVARIANT CHECK",
        missing: "No deterministic invariant evidence was returned.",
        comparison:
          "The source repository was never changed. Deadbolt applied this exact diff to an isolated in-memory clone, then evaluated a deterministic source invariant. No executable tests were run.",
      };
  const filteredFindings = useMemo(
    () =>
      filter === "all"
        ? report.findings
        : report.findings.filter((finding) => finding.severity === filter),
    [filter, report.findings],
  );
  const selectedFinding =
    report.findings.find((finding) => finding.id === selectedFindingId) ??
    filteredFindings[0] ??
    report.findings[0];
  const selectedPatchApplied =
    selectedFinding?.patchStatus === "applied_to_sandbox";
  const selectedRetestPassed = selectedFinding?.retestStatus === "passed";
  const selectedPatchState = !selectedFinding
    ? null
    : selectedRetestPassed
      ? {
          label: "AFTER PATCH",
          headline: "Focused fix applied",
          status: verificationCopy.passed,
          className: "passed",
        }
      : selectedPatchApplied
        ? {
            label: "PATCHED CLONE",
            headline:
              selectedFinding.retestStatus === "failed"
                ? "Patch applied; issue remains"
                : "Patch applied; re-analysis pending",
            status:
              selectedFinding.retestStatus === "failed"
                ? "Root cause not cleared"
                : verificationCopy.incomplete,
            className: "failed",
          }
        : selectedFinding.patchStatus === "generated"
          ? {
              label: "PROPOSED PATCH",
              headline: "Patch proposed, not applied",
              status: "Re-analysis not run",
              className: "incomplete",
            }
          : {
              label: "PATCH STATUS",
              headline: "No patch generated",
              status: "Re-analysis not run",
              className: "incomplete",
            };
  const comparisonNote = !selectedFinding
    ? ""
    : selectedPatchApplied
      ? verificationCopy.comparison
      : selectedFinding.patchStatus === "generated"
        ? "Deadbolt generated a proposed diff but could not apply it cleanly to the isolated in-memory clone. The source repository was never changed, and hunt re-analysis did not run."
        : "Deadbolt did not generate an applicable diff for this finding. The source repository was never changed, and hunt re-analysis did not run.";

  function changeFilter(nextFilter: ReportFilter) {
    const matches =
      nextFilter === "all"
        ? report.findings
        : report.findings.filter(
            (finding) => finding.severity === nextFilter,
          );

    setFilter(nextFilter);
    if (!matches.some((finding) => finding.id === selectedFindingId)) {
      setSelectedFindingId(matches[0]?.id ?? report.findings[0]?.id ?? "");
    }
  }

  if (!selectedFinding) {
    const cleanScanComplete =
      coverageComplete &&
      report.passes.every(
        (pass) => pass.findings.length === 0 && pass.checkedFiles.length > 0,
      );

    return (
      <section className="security-report" aria-labelledby="report-title">
        <header className="report-masthead">
          {onStartOver ? (
            <button type="button" onClick={onStartOver}>
              <span aria-hidden="true">←</span>
              New analysis
            </button>
          ) : (
            <a href="/analyze">
              <span aria-hidden="true">←</span>
              New analysis
            </a>
          )}
          <div>
            <span
              className={`report-engine ${
                report.engine.liveModel ? "live" : "fixture"
              }`}
            >
              {verificationCopy.engine}
            </span>
            <span className="report-run-id">
              {report.runId.slice(0, 14).toUpperCase()}
            </span>
          </div>
        </header>

        <section className="report-verdict clean-report-verdict">
          <div className="verdict-copy">
            <p className="eyebrow">ANALYSIS REPORT · REVIEWABLE EVIDENCE</p>
            <div
              className={`verdict-status ${
                cleanScanComplete ? "verified" : ""
              }`}
            >
              <span aria-hidden="true" />
              <p>
                {cleanScanComplete
                  ? "NO VULNERABILITIES FOUND"
                  : "SCAN INCOMPLETE"}
              </p>
            </div>
            <h2 id="report-title">
              {cleanScanComplete
                ? "No vulnerabilities found in this scan."
                : "No findings returned, but hunt coverage is incomplete."}
            </h2>
            <p className="verdict-summary">
              {cleanScanComplete
                ? "All requested hunt lenses completed and returned no evidence-backed findings in the bounded repository snapshot. This is not a guarantee that the code has no vulnerabilities."
                : "Deadbolt cannot make a clean claim because every requested hunt lens did not return complete coverage."}
            </p>
            <a className="report-jump" href="#hunt-coverage">
              Inspect hunt coverage
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="risk-tally" aria-label="Clean scan totals">
            <div className="risk-total">
              <span>0</span>
              <p>vulnerabilities found</p>
            </div>
            <div className="risk-breakdown">
              <div>
                <span className="risk-swatch clean" />
                <p>Hunt lenses completed</p>
                <strong>{report.coverage.completedClasses.length}</strong>
              </div>
              <div>
                <span className="risk-swatch clean" />
                <p>Files analyzed</p>
                <strong>{report.repository.filesAnalyzed}</strong>
              </div>
              <div>
                <span className="risk-swatch clean" />
                <p>Patches needed</p>
                <strong>0</strong>
              </div>
              <div>
                <span className="risk-swatch clean" />
                <p>Original repository</p>
                <strong>UNCHANGED</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="report-progress" aria-label="Deadbolt progress">
          <article className="complete">
            <span>01</span>
            <div>
              <p>Threat model</p>
              <strong>Mapped</strong>
            </div>
          </article>
          <article className={cleanScanComplete ? "complete" : ""}>
            <span>02</span>
            <div>
              <p>Hunt</p>
              <strong>
                {cleanScanComplete ? "Completed · 0 found" : "Incomplete"}
              </strong>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <p>Patch</p>
              <strong>Not needed</strong>
            </div>
          </article>
          <article>
            <span>04</span>
            <div>
              <p>{verificationCopy.stage}</p>
              <strong>Not needed</strong>
            </div>
          </article>
        </section>

        <section className="hunt-coverage" id="hunt-coverage">
          <div className="report-section-heading compact">
            <div>
              <p className="eyebrow">WHAT DEADBOLT CHECKED</p>
              <h2>Four independent security lenses.</h2>
            </div>
            <p>
              Each clean pass includes its checked-file coverage and the reason
              it did not produce an evidence-backed finding.
            </p>
          </div>

          <div className="hunt-grid">
            {report.passes.map((pass) => (
              <article key={pass.huntClass} className="clean">
                <div className="hunt-card-top">
                  <span className="hunt-status-dot" />
                  <p>{humanizeHuntClass(pass.huntClass)}</p>
                  <strong>Clean</strong>
                </div>
                <p>{pass.summary}</p>
                <div className="hunt-file-count">
                  <span>{pass.checkedFiles.length}</span>
                  files traced
                </div>
                {pass.noFindingReason ? (
                  <small>{pass.noFindingReason}</small>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <details className="report-raw-contract">
          <summary>
            <span>RAW STRUCTURED CONTRACT</span>
            <span>Schema {report.schemaVersion} · inspect JSON</span>
          </summary>
          <pre>{JSON.stringify(report, null, 2)}</pre>
        </details>

        <div
          className={`report-footer ${cleanScanComplete ? "complete" : ""}`}
        >
          <div>
            <span className="status-dot" aria-hidden="true" />
            <p>
              {cleanScanComplete
                ? "ANALYSIS COMPLETE"
                : "ANALYSIS INCOMPLETE"}
            </p>
          </div>
          <p>
            0 FINDINGS · 0 PATCHES NEEDED · ORIGINAL UNCHANGED
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="security-report" aria-labelledby="report-title">
      <header className="report-masthead">
        {onStartOver ? (
          <button type="button" onClick={onStartOver}>
            <span aria-hidden="true">←</span>
            New analysis
          </button>
        ) : (
          <a href="/analyze">
            <span aria-hidden="true">←</span>
            New analysis
          </a>
        )}
        <div>
          <span
            className={`report-engine ${
              report.engine.liveModel ? "live" : "fixture"
            }`}
          >
            {verificationCopy.engine}
          </span>
          <span className="report-run-id">
            {report.runId.slice(0, 14).toUpperCase()}
          </span>
        </div>
      </header>

      <section className="report-verdict">
        <div className="verdict-copy">
          <p className="eyebrow">ANALYSIS REPORT · REVIEWABLE EVIDENCE</p>
          <div
            className={`verdict-status ${allFindingsPassed ? "verified" : ""}`}
          >
            <span aria-hidden="true" />
            <p>{verdict.label}</p>
          </div>
          <h2 id="report-title">{verdict.headline}</h2>
          <p className="verdict-summary">
            {verdict.summary} The clearest example:{" "}
            <strong>{leadFinding?.plainEnglish}</strong>
          </p>
          <a className="report-jump" href="#finding-detail">
            {allFindingsPassed
              ? "Inspect a red → green fix"
              : "Inspect finding and remediation status"}
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="risk-tally" aria-label="Finding severity totals">
          <div className="risk-total">
            <span>{report.remediation.retestsPassed}</span>
            <p>{verificationCopy.passedTotal}</p>
          </div>
          <div className="risk-breakdown">
            <div>
              <span className="risk-swatch critical" />
              <p>Critical found</p>
              <strong>{counts.critical}</strong>
            </div>
            <div>
              <span className="risk-swatch high" />
              <p>High found</p>
              <strong>{counts.high}</strong>
            </div>
            <div>
              <span className="risk-swatch medium" />
              <p>Medium found</p>
              <strong>{counts.medium}</strong>
            </div>
            <div>
              <span className="risk-swatch clean" />
              <p>{verificationCopy.open}</p>
              <strong>{openAfterVerification}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="report-progress" aria-label="Deadbolt progress">
        <article className="complete">
          <span>01</span>
          <div>
            <p>Threat model</p>
            <strong>Mapped</strong>
          </div>
        </article>
        <article className="complete">
          <span>02</span>
          <div>
            <p>Hunt</p>
            <strong>{report.findings.length} confirmed</strong>
          </div>
        </article>
        <article className={allPatchesApplied ? "complete" : ""}>
          <span>03</span>
          <div>
            <p>Patch</p>
            <strong>
              {allPatchesApplied
                ? `${report.remediation.patchesApplied} applied in clone`
                : `${report.remediation.patchesApplied}/${report.findings.length} applied in clone`}
            </strong>
          </div>
        </article>
        <article className={allFindingsPassed ? "complete" : ""}>
          <span>04</span>
          <div>
            <p>{verificationCopy.stage}</p>
            <strong>
              {allFindingsPassed
                ? `${report.remediation.retestsPassed} ${verificationCopy.passedShort}`
                : `${report.remediation.retestsPassed}/${report.findings.length} ${verificationCopy.passedShort}; ${openAfterVerification} open`}
            </strong>
          </div>
        </article>
      </section>

      <div className="report-workspace">
        <aside className="findings-rail" aria-label="Report findings">
          <div className="rail-heading">
            <div>
              <p>FINDINGS</p>
              <span>{filteredFindings.length} shown</span>
            </div>
            <span>SELECT TO EXPLAIN</span>
          </div>

          <div className="finding-filters" aria-label="Filter findings">
            {filters.map((item) => {
              const count =
                item.value === "all"
                  ? report.findings.length
                  : counts[item.value];

              return (
                <button
                  key={item.value}
                  type="button"
                  className={filter === item.value ? "active" : ""}
                  aria-pressed={filter === item.value}
                  onClick={() => changeFilter(item.value)}
                >
                  {item.label}
                  <span>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="finding-list">
            {filteredFindings.map((finding) => (
              <button
                key={finding.id}
                type="button"
                className={
                  selectedFinding.id === finding.id ? "selected" : ""
                }
                aria-pressed={selectedFinding.id === finding.id}
                onClick={() => setSelectedFindingId(finding.id)}
              >
                <span className={`severity-marker ${finding.severity}`} />
                <span className="finding-list-copy">
                  <span>
                    {finding.id} · {humanizeHuntClass(finding.huntClass)}
                  </span>
                  <strong>{finding.title}</strong>
                  <small>{severityGuidance[finding.severity]}</small>
                  <small className="finding-retest">
                    {finding.retestStatus === "passed"
                      ? verificationCopy.findingPassed
                      : finding.retestStatus.toUpperCase()}
                  </small>
                </span>
                <span className="finding-list-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
        </aside>

        <article className="finding-detail" id="finding-detail">
          <header className="finding-detail-header">
            <div className="finding-detail-meta">
              <span className={`severity-badge ${selectedFinding.severity}`}>
                {selectedFinding.severity}
              </span>
              <span>{selectedFinding.id}</span>
              <span>
                {Math.round(selectedFinding.confidence * 100)}% confidence
              </span>
            </div>
            <p>{severityGuidance[selectedFinding.severity]}</p>
          </header>

          <div className="finding-story">
            <p className="eyebrow">WHAT THIS MEANS</p>
            <h2>{selectedFinding.title}</h2>
            <p className="finding-plain-english">
              {selectedFinding.plainEnglish}
            </p>
          </div>

          <div className="impact-comparison">
            <article className="current-state">
              <span>BEFORE PATCH</span>
              <strong>Exposure confirmed</strong>
              <p>{selectedFinding.exploitInPlainTerms}</p>
              <div>
                <span aria-hidden="true" />
                Original risk confirmed
              </div>
            </article>
            <div
              className={`comparison-arrow ${
                selectedRetestPassed ? "passed" : ""
              }`}
              aria-hidden="true"
            >
              →
            </div>
            <article
              className={`target-state ${selectedPatchState?.className ?? "incomplete"}`}
            >
              <span>{selectedPatchState?.label}</span>
              <strong>{selectedPatchState?.headline}</strong>
              <p>{selectedFinding.remediationPlan}</p>
              <div>
                <span aria-hidden="true" />
                {selectedPatchState?.status}
              </div>
            </article>
          </div>
          <p className="comparison-note">{comparisonNote}</p>

          <section className="patch-section">
            <div className="detail-section-heading">
              <div>
                <p>REVIEWABLE PATCH</p>
                <span>{selectedFinding.patchStatus.replaceAll("_", " ")}</span>
              </div>
              <code>{selectedFinding.id}.patch</code>
            </div>
            <pre>
              {selectedFinding.patchDiff ??
                (selectedFinding.patchStatus === "generated"
                  ? "A patch was proposed but could not be applied cleanly. No replayable diff is available."
                  : "No patch was generated.")}
            </pre>
            <div
              className={`retest-proof ${selectedFinding.retestStatus}`}
            >
              <span aria-hidden="true">
                {selectedFinding.retestStatus === "passed" ? "✓" : "!"}
              </span>
              <div>
                <strong>
                  {verificationCopy.proof}{" "}
                  {selectedFinding.retestStatus.toUpperCase()}
                </strong>
                <p>
                  {selectedFinding.retestEvidence ??
                    verificationCopy.missing}
                </p>
              </div>
            </div>
          </section>

          <section className="evidence-section">
            <div className="detail-section-heading">
              <div>
                <p>SOURCE EVIDENCE</p>
                <span>
                  {selectedFinding.evidence.length} linked{" "}
                  {selectedFinding.evidence.length === 1 ? "location" : "locations"}
                </span>
              </div>
              <code>
                {selectedFinding.file}:{selectedFinding.line}
              </code>
            </div>

            <div className="evidence-stack">
              {selectedFinding.evidence.map((item, index) => (
                <article
                  key={`${item.path}-${item.startLine}-${index}`}
                  className="evidence-card"
                >
                  <header>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <code>
                      {item.path}:{item.startLine}
                      {item.endLine !== item.startLine
                        ? `–${item.endLine}`
                        : ""}
                    </code>
                  </header>
                  <pre>{item.excerpt}</pre>
                  <p>{item.reason}</p>
                </article>
              ))}
            </div>
          </section>
        </article>
      </div>

      <section className="threat-model-report">
        <div className="report-section-heading">
          <div>
            <p className="eyebrow">HOW THE APP IS EXPOSED</p>
            <h2>The threat model behind the findings.</h2>
          </div>
          <p>{report.threatModel.summary}</p>
        </div>

        <div className="entry-point-grid">
          {report.threatModel.entryPoints.map((entry, index) => (
            <article key={entry.path}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{entry.kind}</p>
              <h3>{entry.name}</h3>
              <code>{entry.path}</code>
              <div aria-hidden="true">↓</div>
              <small>{entry.trustBoundary}</small>
            </article>
          ))}
        </div>

        <div className="threat-flow-grid">
          <article>
            <p>HIGH-VALUE ASSETS</p>
            {report.threatModel.sensitiveAssets.map((asset) => (
              <div key={asset.name}>
                <span>{asset.sensitivity}</span>
                <strong>{asset.name}</strong>
              </div>
            ))}
          </article>
          <article>
            <p>TRACED DATA FLOWS</p>
            {report.threatModel.dataFlows.map((flow, index) => (
              <div key={flow}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{flow}</strong>
              </div>
            ))}
          </article>
        </div>
      </section>

      <section className="hunt-coverage">
        <div className="report-section-heading compact">
          <div>
            <p className="eyebrow">WHAT DEADBOLT CHECKED</p>
            <h2>Four independent security lenses.</h2>
          </div>
          <p>
            A clean pass is reported as evidence too. Deadbolt does not invent a
            finding to make every hunt look busy.
          </p>
        </div>

        <div className="hunt-grid">
          {report.passes.map((pass) => (
            <article
              key={pass.huntClass}
              className={pass.findings.length === 0 ? "clean" : ""}
            >
              <div className="hunt-card-top">
                <span className="hunt-status-dot" />
                <p>{humanizeHuntClass(pass.huntClass)}</p>
                <strong>
                  {pass.findings.length === 0
                    ? "Clean"
                    : `${pass.findings.length} found`}
                </strong>
              </div>
              <p>{pass.summary}</p>
              <div className="hunt-file-count">
                <span>{pass.checkedFiles.length}</span>
                files traced
              </div>
              {pass.noFindingReason ? (
                <small>{pass.noFindingReason}</small>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <details className="report-raw-contract">
        <summary>
          <span>RAW STRUCTURED CONTRACT</span>
          <span>Schema {report.schemaVersion} · inspect JSON</span>
        </summary>
        <pre>{JSON.stringify(report, null, 2)}</pre>
      </details>

      <div className={`report-footer ${allFindingsPassed ? "complete" : ""}`}>
        <div>
          <span className="status-dot" aria-hidden="true" />
          <p>
            {allFindingsPassed
              ? "FULL LOOP COMPLETE"
              : "REMEDIATION INCOMPLETE"}
          </p>
        </div>
        <p>
          {report.remediation.patchesApplied}/{report.findings.length} PATCHES
          APPLIED · {report.remediation.retestsPassed}/{report.findings.length}{" "}
          {verificationCopy.passedShort.toUpperCase()} · ORIGINAL UNCHANGED
        </p>
      </div>
    </section>
  );
}
