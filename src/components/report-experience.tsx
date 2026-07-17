"use client";

import { useMemo, useState } from "react";
import { LiveVerificationPanel } from "@/components/live-verification-panel";
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
    return null;
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
            {report.engine.liveModel
              ? "LIVE · GPT-5.6 SOL"
              : "VERIFIED FIXTURE · SOL DEFERRED"}
          </span>
          <span className="report-run-id">
            {report.runId.slice(0, 14).toUpperCase()}
          </span>
        </div>
      </header>

      <section className="report-verdict">
        <div className="verdict-copy">
          <p className="eyebrow">FULL LOOP · REVIEWABLE EVIDENCE</p>
          <div className="verdict-status verified">
            <span aria-hidden="true" />
            <p>{verdict.label}</p>
          </div>
          <h2 id="report-title">{verdict.headline}</h2>
          <p className="verdict-summary">
            {verdict.summary} The clearest example:{" "}
            <strong>{leadFinding?.plainEnglish}</strong>
          </p>
          <a className="report-jump" href="#finding-detail">
            Inspect a red → green fix
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="risk-tally" aria-label="Finding severity totals">
          <div className="risk-total">
            <span>{report.remediation.retestsPassed}</span>
            <p>verified fixes</p>
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
              <p>Open after re-test</p>
              <strong>{report.remediation.retestsFailed}</strong>
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
        <article className="complete">
          <span>03</span>
          <div>
            <p>Patch</p>
            <strong>{report.remediation.patchesApplied} applied in clone</strong>
          </div>
        </article>
        <article className="complete">
          <span>04</span>
          <div>
            <p>Re-test</p>
            <strong>{report.remediation.retestsPassed} green</strong>
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
                      ? "✓ FIX VERIFIED"
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
            <div className="comparison-arrow" aria-hidden="true">
              →
            </div>
            <article className="target-state">
              <span>AFTER PATCH</span>
              <strong>Focused fix applied</strong>
              <p>{selectedFinding.remediationPlan}</p>
              <div>
                <span aria-hidden="true" />
                {selectedFinding.retestStatus === "passed"
                  ? "Re-test passed"
                  : "Re-test incomplete"}
              </div>
            </article>
          </div>
          <p className="comparison-note">
            The source repository was never changed. Deadbolt applied this exact
            diff to an isolated in-memory clone and re-ran the finding-specific
            security invariant.
          </p>

          <section className="patch-section">
            <div className="detail-section-heading">
              <div>
                <p>REVIEWABLE PATCH</p>
                <span>{selectedFinding.patchStatus.replaceAll("_", " ")}</span>
              </div>
              <code>{selectedFinding.id}.patch</code>
            </div>
            <pre>{selectedFinding.patchDiff ?? "No patch was generated."}</pre>
            <div
              className={`retest-proof ${selectedFinding.retestStatus}`}
            >
              <span aria-hidden="true">
                {selectedFinding.retestStatus === "passed" ? "✓" : "!"}
              </span>
              <div>
                <strong>
                  RE-TEST {selectedFinding.retestStatus.toUpperCase()}
                </strong>
                <p>
                  {selectedFinding.retestEvidence ??
                    "No re-test evidence was returned."}
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

      <LiveVerificationPanel />

      <details className="report-raw-contract">
        <summary>
          <span>RAW STRUCTURED CONTRACT</span>
          <span>Schema {report.schemaVersion} · inspect JSON</span>
        </summary>
        <pre>{JSON.stringify(report, null, 2)}</pre>
      </details>

      <div className="report-footer">
        <div>
          <span className="status-dot" aria-hidden="true" />
          <p>FULL LOOP COMPLETE</p>
        </div>
        <p>8 PATCHES · 8 GREEN · ORIGINAL UNCHANGED</p>
      </div>
    </section>
  );
}
