import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function source(path) {
  return readFile(join(root, path), "utf8");
}

const manifest = JSON.parse(await source("VULNERABILITY_MANIFEST.json"));
assert.equal(manifest.findings.length, 8, "Expected eight planted findings");

const clientConfig = await source("src/lib/client-config.ts");
assert.match(
  clientConfig,
  /sk_live_demo_invoicepilot_NOT_A_REAL_SECRET/,
  "Client bundle seed is missing",
);

const migration = await source(
  "supabase/migrations/001_create_invoices.sql",
);
assert.match(migration, /grant select, insert, update, delete/i);
assert.doesNotMatch(
  migration,
  /enable\s+row\s+level\s+security/i,
  "The migration unexpectedly enables RLS",
);

const invoiceRoute = await source("src/app/api/invoices/[id]/route.ts");
assert.match(invoiceRoute, /getInvoiceById/);
assert.doesNotMatch(invoiceRoute, /ownerId|currentUser|authorize/i);

const loginRoute = await source("src/app/api/auth/login/route.ts");
assert.doesNotMatch(loginRoute, /rateLimit|throttl|lockout|attemptCount/i);

const config = await source("next.config.ts");
assert.match(config, /Access-Control-Allow-Origin/);
assert.match(config, /value:\s*"\*"/);
for (const header of [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Referrer-Policy",
]) {
  assert.doesNotMatch(config, new RegExp(header, "i"));
}

const exportRoute = await source("src/app/api/reports/export/route.ts");
assert.match(exportRoute, /internalError\.stack/);
assert.match(exportRoute, /process\.env\.NODE_ENV/);

const logoutRoute = await source("src/app/api/auth/logout/route.ts");
assert.doesNotMatch(logoutRoute, /Set-Cookie|cookies\(\)|\.delete\(/);

console.log("✓ Verified 8 synthetic InvoicePilot vulnerability seeds");
