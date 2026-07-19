"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { ReportExperience } from "@/components/report-experience";
import type {
  AnalysisReport,
  RepositoryFile,
} from "@/lib/analysis/schemas";
import { browserUploadPath } from "@/lib/analysis/browser-upload";

type RunState = "idle" | "reading" | "running" | "error";

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

const directoryPickerAttributes = {
  webkitdirectory: "",
  directory: "",
} as Record<string, string>;

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
  if (state === "error") return "RUN STOPPED";
  return "AWAITING INTAKE";
}

export function AnalysisConsole() {
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
    const acceptedPaths = new Set<string>();
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

      const path = browserUploadPath(file.name, file.webkitRelativePath);
      if (acceptedPaths.has(path)) {
        excluded += 1;
        continue;
      }

      accepted.push({ path, content });
      acceptedPaths.add(path);
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

    if (files.length === 0) {
      setError("Choose at least one supported source file.");
      return;
    }

    setState("running");
    setError("");
    setReport(null);

    try {
      const body = {
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
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "The analysis run could not be completed.",
      );
      setState("error");
    }
  }

  if (report) {
    return (
      <ReportExperience
        report={report}
        onStartOver={() => {
          setReport(null);
          setState("idle");
          setError("");
          setOwnershipConfirmed(false);
        }}
      />
    );
  }

  return (
    <div className="analysis-console" id="scan">
      <section className="intake-panel">
        <div className="panel-kicker">
          <span>01</span>
          <p>CHOOSE WHAT TO SCAN</p>
        </div>

        <div className="upload-fields public-upload-fields">
          <label>
            Repository name
            <input
              value={repositoryName}
              onChange={(event) => setRepositoryName(event.target.value)}
              maxLength={80}
            />
          </label>
          <label className="file-drop">
            <span>Choose repository folder</span>
            <small>
              Up to 100 text files / 320K characters. Secrets files, private
              keys, dependencies, and build output are excluded.
            </small>
            <input
              type="file"
              multiple
              {...directoryPickerAttributes}
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
          <strong>
            {state === "running"
              ? "Hunting, patching, re-analyzing…"
              : "Run full security loop"}
          </strong>
          <span aria-hidden="true">↘</span>
        </button>

        {error ? (
          <p className="analysis-error" role="alert">
            {error}
          </p>
        ) : null}

        <p className="fixture-note">
          Uploaded repositories are processed only for this analysis request.
          Live source analysis requires the configured GPT-5.6 Sol provider.
        </p>
      </section>

      <section className="run-panel" aria-live="polite">
        <div className="run-heading">
          <div>
            <p className="eyebrow">FULL HUNT → PATCH → RE-ANALYZE PIPELINE</p>
            <h2>No analysis run yet</h2>
          </div>
          <span className="engine-pill fixture">AWAITING RUN</span>
        </div>

        <div className="run-stages">
          <div>
            <span>01</span>
            <p>Intake</p>
            <strong>—</strong>
          </div>
          <div>
            <span>02</span>
            <p>Threat model</p>
            <strong>—</strong>
          </div>
          <div>
            <span>03</span>
            <p>Four hunts</p>
            <strong>—</strong>
          </div>
          <div>
            <span>04</span>
            <p>Human stakes</p>
            <strong>—</strong>
          </div>
          <div>
            <span>05</span>
            <p>Focused patches</p>
            <strong>—</strong>
          </div>
          <div>
            <span>06</span>
            <p>Hunt re-analysis</p>
            <strong>—</strong>
          </div>
        </div>

        <div className="empty-run">
          <span>DB—READY</span>
          <p>
            Add source files and confirm ownership to start the threat model,
            four focused hunts, isolated patches, and affected-hunt re-analysis.
          </p>
        </div>
      </section>
    </div>
  );
}
