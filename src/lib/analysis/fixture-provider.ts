import {
  AnalysisReportSchema,
  type AnalysisReport,
  type Evidence,
  type Finding,
  type HuntClass,
  type HuntPass,
  type ThreatModel,
  huntClasses,
} from "./schemas";
import { remediateInvoicePilot } from "./patch-engine";
import type { PreparedRepository } from "./repository";

const checkedFiles: Record<HuntClass, string[]> = {
  secrets: [
    "src/lib/client-config.ts",
    "src/components/provider-status.tsx",
    "src/components/app-shell.tsx",
  ],
  auth_idor: [
    "src/app/api/auth/login/route.ts",
    "src/app/api/auth/logout/route.ts",
    "src/app/api/invoices/route.ts",
    "src/app/api/invoices/[id]/route.ts",
    "src/app/invoice/[id]/page.tsx",
    "src/lib/data.ts",
    "supabase/migrations/001_create_invoices.sql",
  ],
  injection: [
    "src/app/api/auth/login/route.ts",
    "src/app/api/invoices/[id]/route.ts",
    "src/app/api/reports/export/route.ts",
    "src/lib/data.ts",
    "supabase/migrations/001_create_invoices.sql",
  ],
  config: [
    "next.config.ts",
    "vercel.json",
    "src/app/api/auth/login/route.ts",
    "src/app/api/reports/export/route.ts",
  ],
};

function evidence(
  path: string,
  startLine: number,
  endLine: number,
  excerpt: string,
  reason: string,
): Evidence {
  return { path, startLine, endLine, excerpt, reason };
}

function finding(
  value: Omit<
    Finding,
    "patchDiff" | "patchStatus" | "retestStatus" | "retestEvidence"
  >,
): Finding {
  return {
    ...value,
    patchDiff: null,
    patchStatus: "not_generated",
    retestStatus: "not_run",
    retestEvidence: null,
  };
}

const findings: Finding[] = [
  finding({
    id: "IP-001",
    huntClass: "secrets",
    category: "client-secret-exposure",
    severity: "critical",
    confidence: 1,
    title: "Secret-shaped billing key ships in the browser bundle",
    file: "src/lib/client-config.ts",
    line: 1,
    evidence: [
      evidence(
        "src/lib/client-config.ts",
        1,
        2,
        'export const billingProviderKey = "sk_live_demo_invoicepilot_NOT_A_REAL_SECRET_7H4M2Q9X";',
        "A provider credential is declared as a client-importable source literal.",
      ),
      evidence(
        "src/components/provider-status.tsx",
        1,
        9,
        '"use client"; … billingProviderKey.slice(-8)',
        "A Client Component imports the complete value. Masking the rendered suffix does not remove the full literal from JavaScript.",
      ),
    ],
    plainEnglish:
      "Any visitor can download the app’s JavaScript and recover the entire billing credential, even though the UI displays only its last eight characters.",
    exploitInPlainTerms:
      "A visitor inspects the browser-delivered JavaScript and reads the embedded value. No server access is required.",
    remediationPlan:
      "Move provider credentials to a server-only environment variable and expose only the minimum non-sensitive status data to the client.",
  }),
  finding({
    id: "IP-002",
    huntClass: "auth_idor",
    category: "missing-row-level-security",
    severity: "critical",
    confidence: 1,
    title: "Invoice ownership exists, but the database never enforces it",
    file: "supabase/migrations/001_create_invoices.sql",
    line: 12,
    evidence: [
      evidence(
        "supabase/migrations/001_create_invoices.sql",
        1,
        12,
        "owner_id text not null … grant select, insert, update, delete on public.invoices to anon, authenticated;",
        "The table stores an owner but grants both public roles complete access without enabling RLS or creating an ownership policy.",
      ),
    ],
    plainEnglish:
      "The database knows who owns each invoice but does not use that information to stop one customer from reading or changing another customer’s records.",
    exploitInPlainTerms:
      "A caller using the public database role can request rows belonging to other accounts because no row policy filters them.",
    remediationPlan:
      "Enable row-level security and add policies that compare owner_id with the authenticated user for every permitted operation.",
  }),
  finding({
    id: "IP-003",
    huntClass: "auth_idor",
    category: "idor-bola",
    severity: "high",
    confidence: 1,
    title: "Changing an invoice number reveals another customer’s invoice",
    file: "src/app/api/invoices/[id]/route.ts",
    line: 7,
    evidence: [
      evidence(
        "src/app/api/invoices/[id]/route.ts",
        3,
        14,
        "const invoice = getInvoiceById(id); return Response.json({ invoice });",
        "The API accepts the route ID and returns its record without reading a session or checking ownership.",
      ),
      evidence(
        "src/lib/data.ts",
        135,
        136,
        "return invoices.find((invoice) => invoice.id === Number(id));",
        "The shared lookup compares only the public numeric ID.",
      ),
      evidence(
        "src/lib/data.ts",
        22,
        28,
        'currentUser.id = "user_maya_01"',
        "The displayed user differs from the owner of invoice 2044, proving the cross-tenant path.",
      ),
    ],
    plainEnglish:
      "A signed-out visitor or another customer can change one number in the URL and read a different customer’s client name, email, amount, dates, and line items.",
    exploitInPlainTerms:
      "Requesting invoice 2044 returns Omar’s invoice while the app presents Maya as the current user.",
    remediationPlan:
      "Require a validated session and fetch invoices by both invoice ID and authenticated owner ID. Return not found for every mismatch.",
  }),
  finding({
    id: "IP-004",
    huntClass: "auth_idor",
    category: "missing-login-rate-limit",
    severity: "high",
    confidence: 0.99,
    title: "Login accepts unlimited password attempts",
    file: "src/app/api/auth/login/route.ts",
    line: 5,
    evidence: [
      evidence(
        "src/app/api/auth/login/route.ts",
        5,
        28,
        "export async function POST(request: Request) { … if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) … }",
        "The complete login flow has no attempt counter, delay, lockout, IP budget, or external rate limiter.",
      ),
    ],
    plainEnglish:
      "Someone can keep guessing passwords as quickly as the server will answer because failed attempts never slow down or stop.",
    exploitInPlainTerms:
      "Repeated POST requests receive ordinary authentication responses indefinitely instead of a throttling response.",
    remediationPlan:
      "Add a shared per-account and per-network rate limit, progressive delay, safe error messages, and monitoring for repeated failures.",
  }),
  finding({
    id: "IP-005",
    huntClass: "config",
    category: "permissive-cors",
    severity: "high",
    confidence: 0.99,
    title: "Every website is allowed to read sensitive API responses",
    file: "next.config.ts",
    line: 10,
    evidence: [
      evidence(
        "next.config.ts",
        7,
        26,
        'source: "/api/:path*" … Access-Control-Allow-Origin: *',
        "The wildcard CORS rule applies to every API endpoint and advertises authorization support.",
      ),
      evidence(
        "src/app/api/invoices/route.ts",
        1,
        7,
        "return Response.json({ … invoices });",
        "The affected API returns cross-tenant invoice data, making the wildcard materially useful.",
      ),
    ],
    plainEnglish:
      "Any website can ask a visitor’s browser to read sensitive API data. The current records API is already anonymous, so this widens exposure immediately.",
    exploitInPlainTerms:
      "A page on an unrelated origin makes a browser request to the invoice API and is allowed to read the response.",
    remediationPlan:
      "Allow only explicit owned application origins, vary responses by Origin, and keep credential rules as narrow as the actual client requires.",
  }),
  finding({
    id: "IP-006",
    huntClass: "config",
    category: "verbose-production-errors",
    severity: "medium",
    confidence: 1,
    title: "Report errors disclose stack traces and internal server paths",
    file: "src/app/api/reports/export/route.ts",
    line: 18,
    evidence: [
      evidence(
        "src/app/api/reports/export/route.ts",
        7,
        27,
        "message: error.message, stack: error.stack, environment: process.env.NODE_ENV",
        "An attacker-controlled query branch serializes the raw error, internal template path, stack, and environment into the response.",
      ),
    ],
    plainEnglish:
      "A failed export tells strangers how the server is laid out and includes debugging details that should stay in private logs.",
    exploitInPlainTerms:
      "Selecting the broken export format returns the internal template path, stack trace, and runtime environment in JSON.",
    remediationPlan:
      "Return a generic error identifier to the client and send the detailed exception only to access-controlled server logs.",
  }),
  finding({
    id: "IP-007",
    huntClass: "auth_idor",
    category: "ineffective-logout",
    severity: "medium",
    confidence: 1,
    title: "Logout says success but leaves the session cookie in place",
    file: "src/app/api/auth/logout/route.ts",
    line: 1,
    evidence: [
      evidence(
        "src/app/api/auth/login/route.ts",
        18,
        26,
        'response.cookies.set("invoicepilot_session", DEMO_SESSION, { httpOnly: true, sameSite: "lax", path: "/" })',
        "Login creates the session cookie.",
      ),
      evidence(
        "src/app/api/auth/logout/route.ts",
        1,
        5,
        'return Response.json({ ok: true, message: "Signed out" });',
        "Logout neither expires the browser cookie nor revokes server-side state.",
      ),
    ],
    plainEnglish:
      "The interface can say a user signed out while the browser keeps the same session token.",
    exploitInPlainTerms:
      "After logout, the original cookie remains available for any route that trusts it.",
    remediationPlan:
      "Expire the cookie with matching attributes and revoke the backing session on the server.",
  }),
  finding({
    id: "IP-008",
    huntClass: "config",
    category: "missing-security-headers",
    severity: "medium",
    confidence: 0.98,
    title: "Rendered pages have no application security-header policy",
    file: "next.config.ts",
    line: 3,
    evidence: [
      evidence(
        "next.config.ts",
        3,
        28,
        "const nextConfig = { async headers() { … only API CORS headers … } }",
        "The complete application header configuration omits CSP, anti-framing, nosniff, and referrer controls.",
      ),
      evidence(
        "vercel.json",
        1,
        5,
        '{ "framework": "nextjs", "outputDirectory": null }',
        "No deployment-level header policy compensates for the application gap.",
      ),
    ],
    plainEnglish:
      "The browser is missing several guardrails that limit what injected content can load and whether another site can frame the app to trick a user.",
    exploitInPlainTerms:
      "A future content-injection bug or hostile framing page faces fewer browser-enforced restrictions than it should.",
    remediationPlan:
      "Define a tested global CSP, anti-framing policy, nosniff, referrer policy, and an explicit transport policy appropriate for the hosting edge.",
  }),
];

const threatModel: ThreatModel = {
  summary:
    "The internal fixture is a synthetic multi-tenant dashboard with public Next.js routes, a decorative login cookie, in-memory records, and a Supabase-shaped schema that grants broad database access.",
  architecture: [
    "Next.js App Router pages and Route Handlers",
    "Browser-rendered dashboard with a client-side provider status component",
    "In-memory synthetic invoice repository",
    "Supabase-style SQL migration without a connected database",
  ],
  entryPoints: [
    {
      name: "Login",
      kind: "POST JSON API",
      path: "src/app/api/auth/login/route.ts",
      trustBoundary: "Untrusted browser input enters the authentication boundary.",
    },
    {
      name: "Invoice collection",
      kind: "GET API",
      path: "src/app/api/invoices/route.ts",
      trustBoundary: "Anonymous network callers receive tenant data.",
    },
    {
      name: "Invoice detail",
      kind: "Dynamic page and GET API",
      path: "src/app/api/invoices/[id]/route.ts",
      trustBoundary: "A caller-controlled numeric ID selects a sensitive record.",
    },
    {
      name: "Report export",
      kind: "GET API",
      path: "src/app/api/reports/export/route.ts",
      trustBoundary: "Caller-controlled query values reach report and error handling.",
    },
  ],
  sensitiveAssets: [
    {
      name: "Invoice and client data",
      sensitivity: "high",
      paths: ["src/lib/data.ts", "supabase/migrations/001_create_invoices.sql"],
    },
    {
      name: "Authentication state",
      sensitivity: "high",
      paths: [
        "src/app/api/auth/login/route.ts",
        "src/app/api/auth/logout/route.ts",
      ],
    },
    {
      name: "Billing provider credential",
      sensitivity: "high",
      paths: [
        "src/lib/client-config.ts",
        "src/components/provider-status.tsx",
      ],
    },
  ],
  authFlows: [
    "The login route compares one public demo credential pair and sets a static HttpOnly cookie.",
    "No protected page or API reads the session cookie before returning invoice data.",
    "Logout returns success without deleting the cookie or revoking a session.",
  ],
  dataFlows: [
    "Route ID → getInvoiceById → cross-tenant invoice JSON/page",
    "Global invoice array → anonymous collection API → client response",
    "Client-imported provider key → browser JavaScript chunk",
    "Export format/query → thrown error → raw stack and environment JSON",
  ],
  trustBoundaries: [
    "Internet caller to public Route Handlers",
    "Authenticated identity to tenant-owned invoice record",
    "Server-only provider credential to browser bundle",
    "Private server diagnostics to public error response",
  ],
  assumptions: [
    "All records and credentials are synthetic and intentionally non-operational.",
    "The SQL migration is analyzed as the intended production authorization model even though no database is connected.",
    "No live third-party system is probed.",
  ],
  priorityHunts: [...huntClasses],
};

function buildPasses(): HuntPass[] {
  return huntClasses.map((huntClass) => {
    const passFindings = findings.filter(
      (item) => item.huntClass === huntClass,
    );

    return {
      agentId: `fixture-${huntClass}`,
      huntClass,
      summary:
        passFindings.length > 0
          ? `Confirmed ${passFindings.length} evidence-backed ${huntClass} finding${passFindings.length === 1 ? "" : "s"}.`
          : "No executable injection sink was found after tracing each untrusted input to its terminal use.",
      findings: passFindings,
      checkedFiles: checkedFiles[huntClass],
      noFindingReason:
        huntClass === "injection"
          ? "User-controlled values terminate in numeric comparisons or JSON strings; no SQL, shell, template, filesystem, redirect, or deserialization sink is present."
          : null,
      verificationResults: [],
    };
  });
}

export function runFixtureAnalysis(
  repository: PreparedRepository,
  runId: string,
  elapsedMs: number,
): AnalysisReport {
  const initialPasses = buildPasses();
  const remediation = remediateInvoicePilot(
    repository.snapshot,
    findings,
  );
  const remediatedById = new Map(
    remediation.findings.map((item) => [item.id, item]),
  );
  const passes = initialPasses.map((pass) => ({
    ...pass,
    findings: pass.findings.map(
      (item) => remediatedById.get(item.id) ?? item,
    ),
  }));

  return AnalysisReportSchema.parse({
    schemaVersion: "1.0.0",
    runId,
    generatedAt: new Date().toISOString(),
    elapsedMs,
    engine: {
      provider: "fixture",
      model: "deterministic-private-fixture-ground-truth",
      liveModel: false,
      reasoningEffort: "fixture",
      ptcStatus: "fixture_simulated",
      promptCacheStatus: "wired_unmeasured",
    },
    repository: {
      name: repository.snapshot.name,
      source: repository.snapshot.source,
      filesAnalyzed: repository.snapshot.files.length,
      charactersAnalyzed: repository.characters,
      excludedFiles: repository.excludedFiles,
    },
    threatModel,
    passes,
    findings: remediation.findings,
    coverage: {
      requestedClasses: [...huntClasses],
      completedClasses: [...huntClasses],
      cleanClasses: ["injection"],
    },
    remediation: remediation.summary,
    usage: {
      requestCount: 0,
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      cachedTokens: 0,
      cacheWriteTokens: 0,
    },
  });
}
