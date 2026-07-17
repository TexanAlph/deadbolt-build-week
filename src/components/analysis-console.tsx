"use client";

import { ChangeEvent, useMemo, useState } from "react";
import type {
  AnalysisReport,
  RepositoryFile,
} from "@/lib/analysis/schemas";

type IntakeMode = "demo" | "upload";
type RunState = "idle" | "reading" | "running" | "complete" | "error";

const allowedExtensions = [
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".prisma",
  ".py",
  ".rb",
  ".rs",
  ".sql",
  ".toml",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
];

const severityLabels: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  informational: "Info",
};

function isAcceptedFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    name === ".env.example" ||
    (name !== ".env" &&
      !name.endsWith(".pem") &&
      !name.endsWith(".key") &&
      allowedExtensions.some((extension) => name.endsWith(extension)))
  );
}

function statusText(state: RunState) {
  if (state === "reading") return "READING FILES";
  if (state === "running") return "RUNNING CORE";
  if (state === "complete") return "CONTRACT READY";
  if (state === "error") return "RUN STOPPED";
  return "AWAITING INTAKE";
}

export function AnalysisConsole() {
  const [mode, setMode] = useState<IntakeMode>("demo");
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [repositoryName, setRepositoryName] = useState("My application");
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [excludedCount, setExcludedCount] = useState(0);
  const [state, setState] = useState<RunState>("idle");
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState("");

  const selectedCharacters = useMemo(
    () => files.reduce((total, file) => total + file.content.length, 0),
    [files],
  );

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    setState("reading");
    setReport(null);
    setError("");
    const selected = Array.from(event.target.files ?? []);
    const accepted: RepositoryFile[] = [];
    let excluded = 0;
    let totalCharacters = 0;

    for (const file of selected.slice(0, 120)) {
      if (!isAcceptedFile(file) || file.size > 60_000) {
        excluded += 1;
        continue;
      }

      const content = await file.text();
      if (
        content.includes("\0") ||
        totalCharacters + content.length > 320_000 ||
        accepted.length >= 100
      ) {
        excluded += 1;
        continue;
      }

      accepted.push({ path: file.webkitRelativePath || file.name, content });
      totalCharacters += content.length;
    }

    setFiles(accepted);
    setExcludedCount(excluded + Math.max(0, selected.length - 120));
    setState("idle");
  }

  async function runAnalysis() {
    if (!ownershipConfirmed) {
      setError("Confirm that you own or are authorized to audit this code.");
      return;
    }

    if (mode === "upload" && files.length === 0) {
      setError("Choose at least one supported source file.");
      return;
    }

    setState("running");
    setError("");
    setReport(null);

    try {
      const body =
        mode === "demo"
          ? { source: "demo", ownershipConfirmed: true }
          : {
              source: "upload",
              ownershipConfirmed: true,
              repository: {
                name: repositoryName,
                source: "upload",
                files,
              },
            };
      const request = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await request.json()) as {
        report?: AnalysisReport;
        error?: { message?: string };
      };

      if (!request.ok || !payload.report) {
        throw new Error(
          payload.error?.message ?? "The analysis run did not return a report.",
        );
      }

      setReport(payload.report);
      setState("complete");
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "The analysis run could not be completed.",
      );
      setState("error");
    }
  }

  return (
    <div className="analysis-console">
      <section className="intake-panel">
        <div className="panel-kicker">
          <span>01</span>
          <p>REPOSITORY INTAKE</p>
        </div>

        <div className="mode-switch" aria-label="Repository source">
          <button
            className={mode === "demo" ? "active" : ""}
            type="button"
            onClick={() => {
              setMode("demo");
              setReport(null);
              setError("");
            }}
          >
            InvoicePilot demo
          </button>
          <button
            className={mode === "upload" ? "active" : ""}
            type="button"
            onClick={() => {
              setMode("upload");
              setReport(null);
              setError("");
            }}
          >
            My source files
          </button>
        </div>

        {mode === "demo" ? (
          <div className="demo-repo-card">
            <div>
              <p className="repo-name">InvoicePilot</p>
              <p>
                Synthetic invoice SaaS · 19 source files · 8 planted findings
              </p>
            </div>
            <span>GROUND TRUTH</span>
          </div>
        ) : (
          <div className="upload-fields">
            <label>
              Repository name
              <input
                value={repositoryName}
                onChange={(event) => setRepositoryName(event.target.value)}
                maxLength={80}
              />
            </label>
            <label className="file-drop">
              <span>Choose source files</span>
              <small>
                Up to 100 text files / 320K characters. Secrets files, private
                keys, dependencies, and build output are excluded.
              </small>
              <input
                type="file"
                multiple
                onChange={handleFiles}
                accept={allowedExtensions.join(",")}
              />
            </label>
            <div className="file-stats" aria-live="polite">
              <span>{files.length} accepted</span>
              <span>{selectedCharacters.toLocaleString()} characters</span>
              <span>{excludedCount} excluded</span>
            </div>
          </div>
        )}

        <label className="ownership-check">
          <input
            type="checkbox"
            checked={ownershipConfirmed}
            onChange={(event) => setOwnershipConfirmed(event.target.checked)}
          />
          <span>
            I own this code or I am explicitly authorized to audit it.
          </span>
        </label>

        <button
          className="run-analysis"
          type="button"
          onClick={runAnalysis}
          disabled={state === "running" || state === "reading"}
        >
          <span>{statusText(state)}</span>
          <strong>{state === "running" ? "Working…" : "Run core analysis"}</strong>
          <span aria-hidden="true">↘</span>
        </button>

        {error ? (
          <p className="analysis-error" role="alert">
            {error}
          </p>
        ) : null}

        <p className="fixture-note">
          Without an API key, only InvoicePilot runs in deterministic fixture
          mode. Uploaded repositories remain local to this request and require
          the live GPT-5.6 Sol provider.
        </p>
      </section>

      <section className="run-panel" aria-live="polite">
        <div className="run-heading">
          <div>
            <p className="eyebrow">M2 · CORE CONTRACT</p>
            <h2>
              {report ? report.repository.name : "No analysis run yet"}
            </h2>
          </div>
          <span
            className={`engine-pill ${
              report?.engine.liveModel ? "live" : "fixture"
            }`}
          >
            {report?.engine.liveModel
              ? "LIVE · GPT-5.6 SOL"
              : "FIXTURE · SOL DEFERRED"}
          </span>
        </div>

        <div className="run-stages">
          <div className={report ? "done" : ""}>
            <span>01</span>
            <p>Intake</p>
            <strong>{report ? `${report.repository.filesAnalyzed} files` : "—"}</strong>
          </div>
          <div className={report ? "done" : ""}>
            <span>02</span>
            <p>Threat model</p>
            <strong>{report ? `${report.threatModel.entryPoints.length} entries` : "—"}</strong>
          </div>
          <div className={report ? "done" : ""}>
            <span>03</span>
            <p>Evidence reducer</p>
            <strong>{report ? report.engine.ptcStatus.replaceAll("_", " ") : "—"}</strong>
          </div>
          <div className={report ? "done" : ""}>
            <span>04</span>
            <p>Parallel hunts</p>
            <strong>{report ? `${report.passes.length}/4 complete` : "—"}</strong>
          </div>
        </div>

        {report ? (
          <>
            <div className="contract-summary">
              <div>
                <span>{report.findings.length}</span>
                <p>structured findings</p>
              </div>
              <div>
                <span>{report.coverage.cleanClasses.length}</span>
                <p>clean passes</p>
              </div>
              <div>
                <span>{report.usage.cachedTokens}</span>
                <p>cached tokens</p>
              </div>
              <div>
                <span>{report.elapsedMs}ms</span>
                <p>fixture runtime</p>
              </div>
            </div>

            <div className="agent-grid">
              {report.passes.map((pass) => (
                <article key={pass.huntClass}>
                  <div>
                    <span className="agent-dot" />
                    <p>{pass.huntClass.replace("_", " + ")}</p>
                  </div>
                  <strong>
                    {pass.findings.length > 0
                      ? `${pass.findings.length} confirmed`
                      : "clean pass"}
                  </strong>
                </article>
              ))}
            </div>

            <div className="finding-contract">
              <div className="contract-label">
                <p>STRUCTURED JSON FINDINGS</p>
                <span>PATCH + RE-TEST RESERVED FOR M4–M5</span>
              </div>
              {report.findings.map((finding) => (
                <article key={finding.id}>
                  <div className="finding-id">
                    <span>{finding.id}</span>
                    <span className={`severity ${finding.severity}`}>
                      {severityLabels[finding.severity]}
                    </span>
                  </div>
                  <div>
                    <h3>{finding.title}</h3>
                    <p>{finding.plainEnglish}</p>
                    <code>
                      {finding.file}:{finding.line}
                    </code>
                  </div>
                  <div className="confidence">
                    <span>{Math.round(finding.confidence * 100)}%</span>
                    <p>confidence</p>
                  </div>
                </article>
              ))}
            </div>

            <details className="raw-contract">
              <summary>Inspect raw structured contract</summary>
              <pre>{JSON.stringify(report, null, 2)}</pre>
            </details>
          </>
        ) : (
          <div className="empty-run">
            <span>DB—CORE</span>
            <p>
              Confirm ownership and run InvoicePilot to exercise the complete
              M2 data contract.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
