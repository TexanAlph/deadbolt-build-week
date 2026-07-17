import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { ReportExperience } from "../src/components/report-experience";
import { runFixtureAnalysis } from "../src/lib/analysis/fixture-provider";
import { loadDemoRepository } from "../src/lib/analysis/repository";

async function main() {
  const repository = await loadDemoRepository();
  const report = runFixtureAnalysis(repository, "db_report_verifier", 12);
  const html = renderToStaticMarkup(
    <ReportExperience report={report} onStartOver={() => undefined} />,
  );

  assert.match(html, /FULL LOOP · REVIEWABLE EVIDENCE/);
  assert.match(html, /PATCHED \+ VERIFIED/);
  assert.match(html, /8 risks found\. 8 focused fixes re-tested green/);
  assert.match(
    html,
    /Changing an invoice number reveals another customer’s invoice/,
  );
  assert.match(html, /BEFORE PATCH/);
  assert.match(html, /AFTER PATCH/);
  assert.match(html, /REVIEWABLE PATCH/);
  assert.match(html, /RE-TEST PASSED/);
  assert.match(html, /8 green/);
  assert.match(html, /Four independent security lenses/);
  assert.match(html, /A clean pass is reported as evidence too/);
  assert.match(html, /Prove the seeded risks on the live demo/);

  console.log(
    "✓ Final report verified: human stakes, red→green comparison, patch diff, re-test proof, live-verification gate",
  );
}

void main();
