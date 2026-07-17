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

  assert.match(html, /M3 · PLAIN-ENGLISH REPORT/);
  assert.match(html, /NOT READY TO SHIP/);
  assert.match(html, /8 confirmed risks/);
  assert.match(
    html,
    /Changing an invoice number reveals another customer’s invoice/,
  );
  assert.match(html, /RIGHT NOW/);
  assert.match(html, /SAFER TARGET/);
  assert.match(html, /Patch not generated yet/);
  assert.match(html, /Locked · M5/);
  assert.match(html, /Four independent security lenses/);
  assert.match(html, /A clean pass is reported as evidence too/);

  console.log(
    "✓ M3 report verified: human-stakes verdict, IDOR lead, evidence, safer target, milestone gates",
  );
}

void main();
