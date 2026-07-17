import assert from "node:assert/strict";
import { analysisProvider } from "../src/lib/analysis/provider";
import {
  loadDemoRepository,
  normalizeRepositoryPath,
  prepareRepository,
} from "../src/lib/analysis/repository";
import { AnalysisReportSchema } from "../src/lib/analysis/schemas";
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
  assert.equal(report.engine.model, "deterministic-invoicepilot-ground-truth");
  assert.equal(report.repository.name, "InvoicePilot");
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
  assert(
    report.findings.every(
      (finding) =>
        finding.patchDiff === null && finding.retestStatus === "not_run",
    ),
    "M2 must not cross the M4/M5 patch and re-test milestone gate.",
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
  assert.equal(reportVerdict(report).label, "NOT READY TO SHIP");
  assert.match(severityGuidance.critical, /before/i);

  console.log(
    "✓ M2/M3 fixture verified: bounded intake, 4 hunts, 8 findings, plain-English report logic",
  );
}

void main();
