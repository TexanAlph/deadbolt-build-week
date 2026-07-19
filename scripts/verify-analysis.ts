import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { analysisProvider } from "../src/lib/analysis/provider";
import { browserUploadPath } from "../src/lib/analysis/browser-upload";
import {
  loadDemoRepository,
  normalizeRepositoryPath,
  prepareRepository,
} from "../src/lib/analysis/repository";
import { ensureGloballyUniqueFindingIds } from "../src/lib/analysis/finding-ids";
import {
  applyPatchPlans,
  type PatchPlan,
} from "../src/lib/analysis/patch-engine";
import {
  collectNewReanalysisFindings,
  evaluateHuntReanalysis,
} from "../src/lib/analysis/reanalysis";
import {
  AnalysisReportSchema,
  HuntPassSchema,
  type HuntPass,
} from "../src/lib/analysis/schemas";
import {
  chooseLeadFinding,
  reportVerdict,
  severityCounts,
  severityGuidance,
} from "../src/lib/report/presentation";

async function main() {
  process.env.DEADBOLT_ANALYSIS_MODE = "fixture";

  assert.throws(
    () => normalizeRepositoryPath("../outside.ts"),
    /Unsafe repository path/,
    "Traversal paths must fail intake.",
  );
  assert.equal(
    browserUploadPath(
      "route.ts",
      "deadbolt/src/app/api/invoices/[id]/route.ts",
    ),
    "src/app/api/invoices/[id]/route.ts",
    "Directory intake must preserve repository-relative paths.",
  );

  const repeatedSource = [
    'const value = "same";',
    "const untouched = true;",
    'const value = "same";',
    "",
  ].join("\n");
  const patchSnapshot = {
    name: "Line-targeted patch fixture",
    source: "upload" as const,
    files: [{ path: "src/example.ts", content: repeatedSource }],
  };
  const targetedPlan: PatchPlan = {
    findingId: "PATCH-TARGET",
    summary: "Change only the repeated value on line three.",
    edits: [
      {
        path: "src/example.ts",
        startLine: 3,
        endLine: 3,
        expected: 'const value = "same";',
        replacement: 'const value = "patched";',
      },
    ],
  };
  const targetedPatch = applyPatchPlans(patchSnapshot, [targetedPlan]);
  assert.equal(targetedPatch.results[0].applied, true);
  assert.deepEqual(
    targetedPatch.sandbox.files[0].content.split("\n").slice(0, 3),
    [
      'const value = "same";',
      "const untouched = true;",
      'const value = "patched";',
    ],
    "A repeated snippet must be changed only at its explicit line target.",
  );
  assert.match(
    targetedPatch.results[0].diff,
    /^--- a\/src\/example\.ts\n\+\+\+ b\/src\/example\.ts\n@@ -3,1 \+3,1 @@/m,
  );
  assert.doesNotMatch(
    targetedPatch.results[0].diff,
    /focused security patch/,
  );

  const wrongLocationPatch = applyPatchPlans(patchSnapshot, [
    {
      ...targetedPlan,
      findingId: "PATCH-WRONG-LINE",
      edits: [{ ...targetedPlan.edits[0], startLine: 2, endLine: 2 }],
    },
  ]);
  assert.equal(wrongLocationPatch.results[0].applied, false);
  assert.match(
    wrongLocationPatch.results[0].error ?? "",
    /does not match the targeted line range/,
  );
  assert.equal(wrongLocationPatch.sandbox.files[0].content, repeatedSource);

  const noOpPatch = applyPatchPlans(patchSnapshot, [
    {
      ...targetedPlan,
      findingId: "PATCH-NO-OP",
      edits: [
        {
          ...targetedPlan.edits[0],
          replacement: targetedPlan.edits[0].expected,
        },
      ],
    },
  ]);
  assert.equal(noOpPatch.results[0].applied, false);
  assert.match(noOpPatch.results[0].error ?? "", /makes no source change/);
  assert.equal(noOpPatch.sandbox.files[0].content, repeatedSource);

  const replayRoot = mkdtempSync(join(tmpdir(), "deadbolt-unified-diff-"));
  try {
    const replayPath = join(replayRoot, "src/example.ts");
    mkdirSync(dirname(replayPath), { recursive: true });
    writeFileSync(replayPath, repeatedSource);
    const replay = spawnSync("patch", ["-p1", "--batch", "--forward"], {
      cwd: replayRoot,
      input: targetedPatch.results[0].diff,
      encoding: "utf8",
    });
    assert.equal(
      replay.status,
      0,
      `Unified diff must replay with the system patch utility: ${replay.stderr}`,
    );
    assert.equal(
      readFileSync(replayPath, "utf8"),
      targetedPatch.sandbox.files[0].content,
    );
  } finally {
    rmSync(replayRoot, { recursive: true, force: true });
  }

  const filtered = prepareRepository({
    name: "Intake contract",
    source: "upload",
    files: [
      { path: ".env", content: "OPENAI_API_KEY=never-upload-this" },
      { path: "src/app.ts", content: "export const safe = true;" },
      { path: "node_modules/pkg/index.js", content: "ignored" },
    ],
  });
  assert.equal(filtered.snapshot.files.length, 1);
  assert.deepEqual(filtered.excludedFiles, [
    ".env",
    "node_modules/pkg/index.js",
  ]);

  const repository = await loadDemoRepository();
  const report = await analysisProvider.analyze(repository);
  AnalysisReportSchema.parse(report);

  assert.equal(report.engine.provider, "fixture");
  assert.equal(report.engine.liveModel, false);
  assert.equal(report.engine.model, "deterministic-private-fixture-ground-truth");
  assert.equal(report.repository.name, "Internal Security Fixture");
  assert.equal(report.passes.length, 4);
  assert.equal(report.findings.length, 8);
  assert.equal(new Set(report.findings.map((finding) => finding.id)).size, 8);
  assert.deepEqual(
    report.findings.map((finding) => finding.id),
    [
      "IP-001",
      "IP-002",
      "IP-003",
      "IP-004",
      "IP-005",
      "IP-006",
      "IP-007",
      "IP-008",
    ],
  );
  assert.equal(report.schemaVersion, "1.0.0");
  assert.deepEqual(report.remediation, {
    sandboxed: true,
    originalRepositoryUnchanged: true,
    patchesGenerated: 8,
    patchesApplied: 8,
    retestsPassed: 8,
    retestsFailed: 0,
  });
  assert(
    report.findings.every(
      (finding) =>
        finding.patchDiff?.startsWith("--- a/") &&
        finding.patchStatus === "applied_to_sandbox" &&
        finding.retestStatus === "passed" &&
        Boolean(finding.retestEvidence),
    ),
    "Every fixture finding must include an applied diff and deterministic source-invariant evidence.",
  );
  assert(
    repository.snapshot.files
      .find((file) => file.path === "src/lib/client-config.ts")
      ?.content.includes("sk_live_demo_invoicepilot"),
    "The original vulnerable repository must remain unchanged.",
  );

  const injectionPass = report.passes.find(
    (pass) => pass.huntClass === "injection",
  );
  assert(injectionPass, "Injection pass must be present.");
  assert.equal(injectionPass.findings.length, 0);
  assert.match(injectionPass.noFindingReason ?? "", /no SQL, shell, template/i);

  const idor = report.findings.find((finding) => finding.id === "IP-003");
  assert(idor, "The logic-flaw centerpiece must be present.");
  assert.equal(idor.category, "idor-bola");
  assert(
    idor.evidence.some((item) => item.path === "src/lib/data.ts"),
    "The IDOR finding must cite the cross-file lookup path.",
  );

  const clearedPass: HuntPass = {
    agentId: "sol-auth_idor-reanalysis",
    huntClass: "auth_idor",
    summary:
      "Re-analyzed the patched route and owner-scoped data lookup; the original cross-tenant root cause was absent.",
    findings: [],
    checkedFiles: [
      "src/app/api/invoices/[id]/route.ts",
      "src/lib/data.ts",
    ],
    noFindingReason:
      "The route now binds invoice lookup to the authenticated owner.",
    verificationResults: [
      {
        findingId: idor.id,
        verdict: "absent",
        summary:
          "The patched route now requires the authenticated owner in the invoice lookup.",
        checkedFiles: [
          "src/app/api/invoices/[id]/route.ts",
          "src/lib/data.ts",
        ],
        evidence: [
          {
            path: "src/lib/data.ts",
            startLine: 1,
            endLine: 8,
            excerpt: "getInvoiceByIdForOwner(id, ownerId)",
            reason:
              "The lookup requires both the object identifier and authenticated owner.",
          },
        ],
      },
    ],
  };
  const [clearedOutcome] = evaluateHuntReanalysis([idor], [clearedPass]);
  assert.equal(clearedOutcome.status, "passed");
  assert.match(clearedOutcome.evidence, /target-specific patched-code re-analysis/);

  const lingeringPass: HuntPass = {
    ...clearedPass,
    findings: [
      {
        ...idor,
        id: "NEW-ID-FOR-SAME-ROOT",
        plainEnglish:
          "The patched lookup still allows one tenant to read another tenant's invoice.",
      },
    ],
    noFindingReason: null,
    verificationResults: [
      {
        ...clearedPass.verificationResults[0],
        verdict: "present",
        summary:
          "The lookup still returns an invoice without binding it to the authenticated owner.",
      },
    ],
  };
  const [lingeringOutcome] = evaluateHuntReanalysis([idor], [lingeringPass]);
  assert.equal(lingeringOutcome.status, "failed");
  assert.match(lingeringOutcome.evidence, /still detected the original/);

  const [missingPassOutcome] = evaluateHuntReanalysis([idor], []);
  assert.equal(missingPassOutcome.status, "failed");
  assert.match(missingPassOutcome.evidence, /no complete structured hunt result/);

  const incompletePass: HuntPass = {
    ...clearedPass,
    verificationResults: [],
  };
  const [incompleteOutcome] = evaluateHuntReanalysis(
    [idor],
    [incompletePass],
  );
  assert.equal(incompleteOutcome.status, "failed");
  assert.match(incompleteOutcome.evidence, /omitted the required/);

  assert.throws(
    () =>
      HuntPassSchema.parse({
        agentId: "sol-auth_idor-reanalysis",
        huntClass: "auth_idor",
        summary: "",
        findings: [],
        checkedFiles: [],
        noFindingReason: null,
        verificationResults: [],
      }),
    /Too small/,
    "Empty or incomplete model output must fail schema validation.",
  );

  const newFinding = {
    ...idor,
    id: "PATCH-NEW-001",
    category: "session-fix-regression",
    file: "src/app/api/auth/session/route.ts",
    line: 12,
    evidence: [
      {
        path: "src/app/api/auth/session/route.ts",
        startLine: 12,
        endLine: 14,
        excerpt: "return Response.json(session)",
        reason: "The patched route now returns the complete session record.",
      },
    ],
    title: "Patch exposes complete session records",
  };
  const postPatchPass: HuntPass = {
    ...clearedPass,
    findings: [newFinding],
  };
  const surfaced = collectNewReanalysisFindings([idor], [postPatchPass]);
  assert.equal(surfaced.length, 1);
  assert.equal(surfaced[0].id, "PATCH-NEW-001");
  assert.equal(surfaced[0].patchStatus, "not_generated");
  assert.equal(surfaced[0].retestStatus, "not_run");
  assert.match(surfaced[0].retestEvidence ?? "", /patched-code re-analysis/);

  const passesWithCrossAgentCollision = report.passes.map((pass) => ({
    ...pass,
    findings: pass.findings.map((finding, index) =>
      index === 0 &&
      (pass.huntClass === "secrets" || pass.huntClass === "auth_idor")
        ? { ...finding, id: "DB-001" }
        : finding,
    ),
  }));
  const uniquePasses = ensureGloballyUniqueFindingIds(
    passesWithCrossAgentCollision,
  );
  const uniquePassIds = uniquePasses.flatMap((pass) =>
    pass.findings.map((finding) => finding.id),
  );
  assert.equal(new Set(uniquePassIds).size, uniquePassIds.length);
  assert.equal(
    uniquePassIds.filter((id) => id === "DB-001").length,
    1,
    "Only the first model-requested ID may survive a cross-agent collision.",
  );

  assert.throws(
    () =>
      AnalysisReportSchema.parse({
        ...report,
        findings: report.findings.map((finding, index) =>
          index < 2 ? { ...finding, id: "DUPLICATE-ID" } : finding,
        ),
      }),
    /globally unique/,
    "The final report contract must reject duplicate finding IDs.",
  );

  const counts = severityCounts(report.findings);
  assert.deepEqual(
    {
      critical: counts.critical,
      high: counts.high,
      medium: counts.medium,
    },
    { critical: 2, high: 3, medium: 3 },
    "The report severity tally must match the seeded ground truth.",
  );
  assert.equal(
    chooseLeadFinding(report.findings)?.id,
    "IP-003",
    "The report should lead with the cross-tenant logic flaw.",
  );
  assert.equal(reportVerdict(report).label, "PATCHED + INVARIANTS GREEN");
  assert.match(severityGuidance.critical, /before/i);

  console.log(
    "✓ Core loop verified: fixture source invariants plus affected-hunt red→green and lingering-root-cause detection",
  );
}

void main();
