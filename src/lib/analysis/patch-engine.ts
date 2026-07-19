import type {
  Finding,
  RepositorySnapshot,
} from "./schemas";

export interface PatchEdit {
  path: string;
  startLine: number;
  endLine: number;
  expected: string;
  replacement: string;
  locationError?: string;
}

export interface PatchPlan {
  findingId: string;
  summary: string;
  edits: PatchEdit[];
}

export interface AppliedPatch {
  findingId: string;
  applied: boolean;
  diff: string;
  error: string | null;
}

interface PatchEditTemplate {
  path: string;
  expected: string;
  replacement: string;
}

interface PatchPlanTemplate {
  findingId: string;
  summary: string;
  edits: PatchEditTemplate[];
}

interface DiffHunk {
  oldStart: number;
  oldLines: string[];
  newLines: string[];
}

interface AppliedLineDelta {
  path: string;
  startLine: number;
  endLine: number;
  delta: number;
}

function lineCount(lines: string[]) {
  return lines.length;
}

function hunkRange(start: number, count: number) {
  return `${start},${count}`;
}

function renderUnifiedDiff(path: string, hunks: DiffHunk[]) {
  let planDelta = 0;
  const renderedHunks = [...hunks]
    .sort((a, b) => a.oldStart - b.oldStart)
    .map((hunk) => {
      const oldCount = lineCount(hunk.oldLines);
      const newCount = lineCount(hunk.newLines);
      const newStart = hunk.oldStart + planDelta;
      planDelta += newCount - oldCount;

      return [
        `@@ -${hunkRange(hunk.oldStart, oldCount)} +${hunkRange(newStart, newCount)} @@`,
        ...hunk.oldLines.map((line) => `-${line}`),
        ...hunk.newLines.map((line) => `+${line}`),
      ].join("\n");
    });

  return [
    `--- a/${path}`,
    `+++ b/${path}`,
    ...renderedHunks,
    "",
  ].join("\n");
}

function rangesOverlap(
  left: Pick<PatchEdit, "startLine" | "endLine">,
  right: Pick<PatchEdit, "startLine" | "endLine">,
) {
  return left.startLine <= right.endLine && right.startLine <= left.endLine;
}

function adjustedStartLine(
  edit: PatchEdit,
  committedDeltas: AppliedLineDelta[],
) {
  return (
    edit.startLine +
    committedDeltas
      .filter(
        (candidate) =>
          candidate.path === edit.path && candidate.endLine < edit.startLine,
      )
      .reduce((total, candidate) => total + candidate.delta, 0)
  );
}

export function applyPatchPlans(
  source: RepositorySnapshot,
  plans: PatchPlan[],
) {
  const sandbox: RepositorySnapshot = {
    ...source,
    files: source.files.map((file) => ({ ...file })),
  };
  const results: AppliedPatch[] = [];
  const committedDeltas: AppliedLineDelta[] = [];

  for (const plan of plans) {
    const staged = sandbox.files.map((file) => ({ ...file }));
    const validatedEdits: Array<{
      edit: PatchEdit;
      adjustedStart: number;
      oldLines: string[];
      newLines: string[];
    }> = [];
    let error: string | null = null;

    if (plan.edits.length === 0) {
      error = "Patch plan contains no source edits.";
    }

    for (const edit of plan.edits) {
      if (error) {
        break;
      }

      if (edit.locationError) {
        error = edit.locationError;
        break;
      }

      if (edit.expected.length === 0) {
        error = `Patch expected source is empty: ${edit.path}`;
        break;
      }

      if (edit.expected === edit.replacement) {
        error = `Patch makes no source change: ${edit.path}:${edit.startLine}-${edit.endLine}`;
        break;
      }

      if (
        !Number.isInteger(edit.startLine) ||
        !Number.isInteger(edit.endLine) ||
        edit.startLine < 1 ||
        edit.endLine < edit.startLine
      ) {
        error = `Patch has an invalid line range: ${edit.path}:${edit.startLine}-${edit.endLine}`;
        break;
      }

      const matchingFiles = staged.filter(
        (candidate) => candidate.path === edit.path,
      );
      if (matchingFiles.length !== 1) {
        error =
          matchingFiles.length === 0
            ? `Patch target does not exist: ${edit.path}`
            : `Patch target path is ambiguous: ${edit.path}`;
        break;
      }
      const [file] = matchingFiles;

      const previousOverlap = committedDeltas.find(
        (candidate) =>
          candidate.path === edit.path && rangesOverlap(candidate, edit),
      );
      if (previousOverlap) {
        error = `Patch overlaps an earlier applied edit: ${edit.path}:${edit.startLine}-${edit.endLine}`;
        break;
      }

      const planOverlap = validatedEdits.find(
        (candidate) =>
          candidate.edit.path === edit.path &&
          rangesOverlap(candidate.edit, edit),
      );
      if (planOverlap) {
        error = `Patch plan contains overlapping edits: ${edit.path}:${edit.startLine}-${edit.endLine}`;
        break;
      }

      const oldLines = edit.expected.split("\n");
      const expectedRangeLength = edit.endLine - edit.startLine + 1;
      if (oldLines.length !== expectedRangeLength) {
        error = `Patch line range does not match its expected source: ${edit.path}:${edit.startLine}-${edit.endLine}`;
        break;
      }

      const adjustedStart = adjustedStartLine(edit, committedDeltas);
      const currentLines = file.content.split("\n");
      const actual = currentLines
        .slice(adjustedStart - 1, adjustedStart - 1 + oldLines.length)
        .join("\n");
      if (actual !== edit.expected) {
        error = `Expected source does not match the targeted line range: ${edit.path}:${edit.startLine}-${edit.endLine}`;
        break;
      }

      validatedEdits.push({
        edit,
        adjustedStart,
        oldLines,
        newLines:
          edit.replacement.length === 0 ? [] : edit.replacement.split("\n"),
      });
    }

    if (!error) {
      for (const item of [...validatedEdits].sort(
        (a, b) => b.adjustedStart - a.adjustedStart,
      )) {
        const file = staged.find(
          (candidate) => candidate.path === item.edit.path,
        );
        if (!file) {
          error = `Patch target disappeared during staging: ${item.edit.path}`;
          break;
        }
        const lines = file.content.split("\n");
        lines.splice(
          item.adjustedStart - 1,
          item.oldLines.length,
          ...item.newLines,
        );
        file.content = lines.join("\n");
      }
    }

    const diff = error
      ? ""
      : [...new Set(validatedEdits.map((item) => item.edit.path))]
          .map((path) =>
            renderUnifiedDiff(
              path,
              validatedEdits
                .filter((item) => item.edit.path === path)
                .map((item) => ({
                  oldStart: item.edit.startLine,
                  oldLines: item.oldLines,
                  newLines: item.newLines,
                })),
            ),
          )
          .join("\n");

    if (!error) {
      sandbox.files = staged;
      committedDeltas.push(
        ...validatedEdits.map((item) => ({
          path: item.edit.path,
          startLine: item.edit.startLine,
          endLine: item.edit.endLine,
          delta: item.newLines.length - item.oldLines.length,
        })),
      );
    }

    results.push({
      findingId: plan.findingId,
      applied: error === null,
      diff,
      error,
    });
  }

  return { sandbox, results };
}

function locatePatchPlans(
  snapshot: RepositorySnapshot,
  templates: PatchPlanTemplate[],
): PatchPlan[] {
  return templates.map((plan) => ({
    ...plan,
    edits: plan.edits.map((edit): PatchEdit => {
      const matchingFiles = snapshot.files.filter(
        (file) => file.path === edit.path,
      );
      if (matchingFiles.length !== 1) {
        return {
          ...edit,
          startLine: 0,
          endLine: 0,
          locationError: `Fixture patch target is ${
            matchingFiles.length === 0 ? "missing" : "ambiguous"
          }: ${edit.path}`,
        };
      }

      const [file] = matchingFiles;
      const firstIndex = file.content.indexOf(edit.expected);
      const lastIndex = file.content.lastIndexOf(edit.expected);
      if (firstIndex < 0 || firstIndex !== lastIndex) {
        return {
          ...edit,
          startLine: 0,
          endLine: 0,
          locationError:
            firstIndex < 0
              ? `Fixture patch source is missing: ${edit.path}`
              : `Fixture patch source is not unique: ${edit.path}`,
        };
      }

      const afterIndex = firstIndex + edit.expected.length;
      const startsAtLineBoundary =
        firstIndex === 0 || file.content[firstIndex - 1] === "\n";
      const endsAtLineBoundary =
        afterIndex === file.content.length || file.content[afterIndex] === "\n";
      if (!startsAtLineBoundary || !endsAtLineBoundary) {
        return {
          ...edit,
          startLine: 0,
          endLine: 0,
          locationError: `Fixture patch source is not line-aligned: ${edit.path}`,
        };
      }

      const startLine = file.content.slice(0, firstIndex).split("\n").length;
      return {
        ...edit,
        startLine,
        endLine: startLine + edit.expected.split("\n").length - 1,
      };
    }),
  }));
}

function fileContent(snapshot: RepositorySnapshot, path: string) {
  return snapshot.files.find((file) => file.path === path)?.content ?? "";
}

const invoicePilotPatchPlans: PatchPlanTemplate[] = [
  {
    findingId: "IP-001",
    summary: "Keep provider credentials on the server side.",
    edits: [
      {
        path: "src/lib/client-config.ts",
        expected:
          'export const BILLING_PROVIDER_API_KEY =\n  "sk_live_demo_invoicepilot_NOT_A_REAL_SECRET_7H4M2Q9X";',
        replacement:
          'export const BILLING_PROVIDER_STATUS = "Server-side credential";',
      },
      {
        path: "src/components/provider-status.tsx",
        expected: `"use client";

import { BILLING_PROVIDER_API_KEY } from "@/lib/client-config";

export function ProviderStatus() {
  const keySuffix = BILLING_PROVIDER_API_KEY.slice(-8);

  return (
    <div className="provider-status">
      <span className="provider-dot" />
      <span>Billing connected</span>
      <code>••••{keySuffix}</code>
    </div>
  );
}`,
        replacement: `"use client";

import { BILLING_PROVIDER_STATUS } from "@/lib/client-config";

export function ProviderStatus() {
  return (
    <div className="provider-status">
      <span className="provider-dot" />
      <span>Billing connected</span>
      <code>{BILLING_PROVIDER_STATUS}</code>
    </div>
  );
}`,
      },
    ],
  },
  {
    findingId: "IP-002",
    summary: "Enable row-level security and bind every operation to the owner.",
    edits: [
      {
        path: "supabase/migrations/001_create_invoices.sql",
        expected:
          "grant select, insert, update, delete on public.invoices to anon, authenticated;",
        replacement: `alter table public.invoices enable row level security;

create policy "owners read invoices"
  on public.invoices for select
  to authenticated
  using (owner_id = auth.uid());

create policy "owners create invoices"
  on public.invoices for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "owners update invoices"
  on public.invoices for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners delete invoices"
  on public.invoices for delete
  to authenticated
  using (owner_id = auth.uid());

grant select, insert, update, delete on public.invoices to authenticated;`,
      },
    ],
  },
  {
    findingId: "IP-003",
    summary: "Scope invoice lookups to the authenticated owner.",
    edits: [
      {
        path: "src/lib/data.ts",
        expected: `export function getInvoiceById(id: number) {
  return invoices.find((invoice) => invoice.id === id);
}`,
        replacement: `export function getInvoiceByIdForOwner(
  id: number,
  ownerId: string,
) {
  return invoices.find(
    (invoice) => invoice.id === id && invoice.ownerId === ownerId,
  );
}`,
      },
      {
        path: "src/app/api/invoices/[id]/route.ts",
        expected: `import { getInvoiceById } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const invoice = getInvoiceById(Number(id));

  if (!invoice) {
    return Response.json({ message: "Invoice not found" }, { status: 404 });
  }

  return Response.json({ invoice });
}`,
        replacement: `import { currentUser, getInvoiceByIdForOwner } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const invoice = getInvoiceByIdForOwner(Number(id), currentUser.id);

  if (!invoice) {
    return Response.json({ message: "Invoice not found" }, { status: 404 });
  }

  return Response.json({ invoice });
}`,
      },
    ],
  },
  {
    findingId: "IP-004",
    summary: "Throttle repeated failed login attempts.",
    edits: [
      {
        path: "src/app/api/auth/login/route.ts",
        expected: `const DEMO_EMAIL = "maya@northstar.test";
const DEMO_PASSWORD = "invoicepilot-demo";
const DEMO_SESSION = "demo_session_maya_valid_until_2026_07_31";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (body.email !== DEMO_EMAIL || body.password !== DEMO_PASSWORD) {
    return Response.json(
      { message: "Email or password is incorrect." },
      { status: 401 },
    );
  }

  return Response.json(
    {
      ok: true,
      user: { email: DEMO_EMAIL },
    },
    {
      headers: {
        "Set-Cookie": \`invoicepilot_session=\${DEMO_SESSION}; Path=/; HttpOnly; SameSite=Lax\`,
      },
    },
  );
}`,
        replacement: `const DEMO_EMAIL = "maya@northstar.test";
const DEMO_PASSWORD = "invoicepilot-demo";
const DEMO_SESSION = "demo_session_maya_valid_until_2026_07_31";
const WINDOW_MS = 10 * 60 * 1_000;
const MAX_FAILURES = 5;
const failures = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };
  const network =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = \`\${network}:\${body.email?.toLowerCase() ?? "unknown"}\`;
  const now = Date.now();
  const previous = failures.get(key);
  const budget =
    !previous || previous.resetAt <= now
      ? { count: 0, resetAt: now + WINDOW_MS }
      : previous;

  if (budget.count >= MAX_FAILURES) {
    return Response.json(
      { message: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }

  if (body.email !== DEMO_EMAIL || body.password !== DEMO_PASSWORD) {
    budget.count += 1;
    failures.set(key, budget);
    return Response.json(
      { message: "Email or password is incorrect." },
      { status: 401 },
    );
  }

  failures.delete(key);
  return Response.json(
    {
      ok: true,
      user: { email: DEMO_EMAIL },
    },
    {
      headers: {
        "Set-Cookie": \`invoicepilot_session=\${DEMO_SESSION}; Path=/; HttpOnly; SameSite=Lax\`,
      },
    },
  );
}`,
      },
    ],
  },
  {
    findingId: "IP-005",
    summary: "Replace wildcard CORS with the owned application origin.",
    edits: [
      {
        path: "next.config.ts",
        expected: `          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },`,
        replacement: `          {
            key: "Access-Control-Allow-Origin",
            value: "https://invoicepilot-deadbolt-demo.vercel.app",
          },
          {
            key: "Vary",
            value: "Origin",
          },`,
      },
    ],
  },
  {
    findingId: "IP-006",
    summary: "Keep exception details in private logs and return a safe error ID.",
    edits: [
      {
        path: "src/app/api/reports/export/route.ts",
        expected: `  } catch (error) {
    const internalError = error as Error;

    return Response.json(
      {
        message: internalError.message,
        stack: internalError.stack,
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    );
  }`,
        replacement: `  } catch (error) {
    const errorId = crypto.randomUUID();
    console.error("Report export failed", { errorId, error });

    return Response.json(
      {
        message: "Report export failed.",
        errorId,
      },
      { status: 500 },
    );
  }`,
      },
    ],
  },
  {
    findingId: "IP-007",
    summary: "Expire the session cookie during logout.",
    edits: [
      {
        path: "src/app/api/auth/logout/route.ts",
        expected: `export async function POST() {
  return Response.json({
    ok: true,
    message: "You have been signed out.",
  });
}`,
        replacement: `export async function POST() {
  return Response.json(
    {
      ok: true,
      message: "You have been signed out.",
    },
    {
      headers: {
        "Set-Cookie":
          "invoicepilot_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      },
    },
  );
}`,
      },
    ],
  },
  {
    findingId: "IP-008",
    summary: "Add browser-enforced security headers globally.",
    edits: [
      {
        path: "next.config.ts",
        expected: `    return [
      {
        source: "/api/:path*",`,
        replacement: `    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
      {
        source: "/api/:path*",`,
      },
    ],
  },
];

const fixtureInvariantChecks: Record<
  string,
  (snapshot: RepositorySnapshot) => { passed: boolean; evidence: string }
> = {
  "IP-001": (snapshot) => {
    const bundle = snapshot.files.map((file) => file.content).join("\n");
    const passed =
      !bundle.includes("sk_live_demo_invoicepilot") &&
      !bundle.includes("BILLING_PROVIDER_API_KEY");
    return {
      passed,
      evidence: passed
        ? "The sandboxed client bundle contains no provider key literal or client-importable API-key symbol."
        : "A provider key literal or client API-key symbol remains.",
    };
  },
  "IP-002": (snapshot) => {
    const sql = fileContent(
      snapshot,
      "supabase/migrations/001_create_invoices.sql",
    );
    const passed =
      sql.includes("enable row level security") &&
      sql.includes("owner_id = auth.uid()") &&
      !sql.includes("to anon, authenticated");
    return {
      passed,
      evidence: passed
        ? "RLS is enabled, owner-bound policies cover CRUD, and the anonymous grant is gone."
        : "The migration still lacks a complete owner-bound RLS policy.",
    };
  },
  "IP-003": (snapshot) => {
    const route = fileContent(
      snapshot,
      "src/app/api/invoices/[id]/route.ts",
    );
    const data = fileContent(snapshot, "src/lib/data.ts");
    const passed =
      route.includes("getInvoiceByIdForOwner(Number(id), currentUser.id)") &&
      data.includes("invoice.ownerId === ownerId");
    return {
      passed,
      evidence: passed
        ? "Invoice detail now requires both the requested ID and the current owner ID; cross-tenant 2044 no longer resolves."
        : "The invoice lookup remains scoped only by its public ID.",
    };
  },
  "IP-004": (snapshot) => {
    const login = fileContent(
      snapshot,
      "src/app/api/auth/login/route.ts",
    );
    const passed =
      login.includes("MAX_FAILURES = 5") &&
      login.includes("status: 429") &&
      login.includes('"Retry-After": "600"');
    return {
      passed,
      evidence: passed
        ? "The sixth failed login inside the ten-minute budget returns 429 with Retry-After."
        : "The login route still has no bounded failure budget.",
    };
  },
  "IP-005": (snapshot) => {
    const config = fileContent(snapshot, "next.config.ts");
    const passed =
      !config.includes('value: "*"') &&
      config.includes("invoicepilot-deadbolt-demo.vercel.app") &&
      config.includes('key: "Vary"');
    return {
      passed,
      evidence: passed
        ? "API CORS is limited to the owned application origin and varies on Origin."
        : "A wildcard or non-varying API CORS rule remains.",
    };
  },
  "IP-006": (snapshot) => {
    const route = fileContent(
      snapshot,
      "src/app/api/reports/export/route.ts",
    );
    const passed =
      route.includes('"Report export failed."') &&
      route.includes("errorId") &&
      !route.includes("stack: internalError.stack") &&
      !route.includes("environment: process.env.NODE_ENV");
    return {
      passed,
      evidence: passed
        ? "The public 500 response contains a generic message and correlation ID, while exception detail stays in server logs."
        : "The public error response still serializes internal diagnostics.",
    };
  },
  "IP-007": (snapshot) => {
    const route = fileContent(
      snapshot,
      "src/app/api/auth/logout/route.ts",
    );
    const passed =
      route.includes("invoicepilot_session=;") &&
      route.includes("Max-Age=0");
    return {
      passed,
      evidence: passed
        ? "Logout overwrites the matching session cookie with Max-Age=0."
        : "Logout still leaves the browser session cookie active.",
    };
  },
  "IP-008": (snapshot) => {
    const config = fileContent(snapshot, "next.config.ts");
    const passed = [
      "Content-Security-Policy",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "X-Frame-Options",
    ].every((header) => config.includes(header));
    return {
      passed,
      evidence: passed
        ? "The sandboxed global response policy includes CSP, nosniff, referrer, and anti-framing controls."
        : "One or more required browser security headers are still absent.",
    };
  },
};

export function remediateInvoicePilot(
  snapshot: RepositorySnapshot,
  findings: Finding[],
) {
  const { sandbox, results } = applyPatchPlans(
    snapshot,
    locatePatchPlans(snapshot, invoicePilotPatchPlans),
  );
  const byFinding = new Map(
    results.map((result) => [result.findingId, result]),
  );

  const remediatedFindings = findings.map((finding): Finding => {
    const patch = byFinding.get(finding.id);
    const invariantCheck = patch?.applied
      ? fixtureInvariantChecks[finding.id]?.(sandbox)
      : undefined;

    return {
      ...finding,
      patchDiff: patch?.diff || null,
      patchStatus: patch?.applied
        ? "applied_to_sandbox"
        : patch
          ? "generated"
          : "not_generated",
      retestStatus: invariantCheck
        ? invariantCheck.passed
          ? "passed"
          : "failed"
        : "not_run",
      retestEvidence:
        (invariantCheck
          ? `Deterministic fixture source-invariant check (no executable tests): ${invariantCheck.evidence}`
          : undefined) ??
        patch?.error ??
        "No patch was generated.",
    };
  });

  return {
    sandbox,
    findings: remediatedFindings,
    summary: {
      sandboxed: true as const,
      originalRepositoryUnchanged: true as const,
      patchesGenerated: results.length,
      patchesApplied: results.filter((result) => result.applied).length,
      retestsPassed: remediatedFindings.filter(
        (finding) => finding.retestStatus === "passed",
      ).length,
      retestsFailed: remediatedFindings.filter(
        (finding) => finding.retestStatus === "failed",
      ).length,
    },
  };
}
