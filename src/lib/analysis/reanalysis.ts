import type { Finding, HuntClass, HuntPass } from "./schemas";
import { ensureUniqueFindingIds } from "./finding-ids";

export interface ReanalysisOutcome {
  findingId: string;
  status: "passed" | "failed";
  evidence: string;
}

export type ReanalysisFailures = Partial<Record<HuntClass, string>>;

function evidencePaths(finding: Finding) {
  return new Set([
    finding.file,
    ...finding.evidence.map((item) => item.path),
  ]);
}

export function isSameRootCause(
  original: Finding,
  candidate: Finding,
) {
  if (candidate.id === original.id) {
    return true;
  }

  if (
    candidate.huntClass !== original.huntClass ||
    candidate.category !== original.category
  ) {
    return false;
  }

  const originalPaths = evidencePaths(original);
  return [candidate.file, ...candidate.evidence.map((item) => item.path)].some(
    (path) => originalPaths.has(path),
  );
}

function normalizedPaths(paths: Iterable<string>) {
  return new Set(
    [...paths].map((path) => path.trim()).filter((path) => path.length > 0),
  );
}

function incompleteOutcome(finding: Finding, reason: string): ReanalysisOutcome {
  return {
    findingId: finding.id,
    status: "failed",
    evidence: `Fresh ${finding.huntClass} hunt did not provide complete patched-code verification for ${finding.id}: ${reason}`,
  };
}

export function evaluateHuntReanalysis(
  originals: Finding[],
  passes: HuntPass[],
  failures: ReanalysisFailures = {},
): ReanalysisOutcome[] {
  return originals.map((original) => {
    const pass = passes.find(
      (candidate) => candidate.huntClass === original.huntClass,
    );

    if (!pass) {
      return incompleteOutcome(
        original,
        failures[original.huntClass] ??
          "no complete structured hunt result was returned",
      );
    }

    const remaining = pass.findings.find((candidate) =>
      isSameRootCause(original, candidate),
    );

    if (remaining) {
      return {
        findingId: original.id,
        status: "failed",
        evidence: `Fresh ${original.huntClass} hunt still detected the original ${original.category} root cause at ${remaining.file}:${remaining.line}: ${remaining.plainEnglish}`,
      };
    }

    const conclusions = pass.verificationResults.filter(
      (result) => result.findingId === original.id,
    );
    if (conclusions.length !== 1) {
      return incompleteOutcome(
        original,
        conclusions.length === 0
          ? "the hunt omitted the required target-specific conclusion"
          : "the hunt returned conflicting duplicate conclusions",
      );
    }

    const [conclusion] = conclusions;
    if (conclusion.verdict !== "absent") {
      return {
        findingId: original.id,
        status: "failed",
        evidence: `Fresh ${original.huntClass} hunt marked the original root cause ${conclusion.verdict}: ${conclusion.summary}`,
      };
    }

    const targetPaths = normalizedPaths(evidencePaths(original));
    const passPaths = normalizedPaths(pass.checkedFiles);
    const conclusionPaths = normalizedPaths(conclusion.checkedFiles);
    const missingTargetPaths = [...targetPaths].filter(
      (path) => !conclusionPaths.has(path),
    );
    if (missingTargetPaths.length > 0) {
      return incompleteOutcome(
        original,
        `the absence conclusion did not check original evidence path${missingTargetPaths.length === 1 ? "" : "s"} ${missingTargetPaths.join(", ")}`,
      );
    }

    const unreportedCheckedPaths = [...conclusionPaths].filter(
      (path) => !passPaths.has(path),
    );
    if (unreportedCheckedPaths.length > 0) {
      return incompleteOutcome(
        original,
        `the target conclusion cited files absent from hunt coverage: ${unreportedCheckedPaths.join(", ")}`,
      );
    }

    const uncitedEvidence = conclusion.evidence.filter(
      (item) => !conclusionPaths.has(item.path),
    );
    if (uncitedEvidence.length > 0) {
      return incompleteOutcome(
        original,
        "the absence conclusion included evidence outside its checked files",
      );
    }

    return {
      findingId: original.id,
      status: "passed",
      evidence: `Fresh ${original.huntClass} hunt completed target-specific patched-code re-analysis and marked the original ${original.id} ${original.category} root cause absent. ${conclusion.summary}`,
    };
  });
}

export function collectNewReanalysisFindings(
  originals: Finding[],
  passes: HuntPass[],
): Finding[] {
  const newFindings: Finding[] = [];
  const seenFingerprints = new Set<string>();

  for (const candidate of passes.flatMap((pass) => pass.findings)) {
    if (originals.some((original) => isSameRootCause(original, candidate))) {
      continue;
    }

    const fingerprint = [
      candidate.huntClass,
      candidate.category,
      candidate.file,
      candidate.line,
    ].join(":");
    if (seenFingerprints.has(fingerprint)) {
      continue;
    }
    seenFingerprints.add(fingerprint);
    newFindings.push({
      ...candidate,
      patchDiff: null,
      patchStatus: "not_generated",
      retestStatus: "not_run",
      retestEvidence:
        "Discovered during patched-code re-analysis. No patch or verification has been run for this finding.",
    });
  }

  return ensureUniqueFindingIds(
    newFindings,
    originals.map((finding) => finding.id),
  );
}
