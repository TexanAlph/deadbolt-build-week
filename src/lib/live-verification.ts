import { z } from "zod";

const DEFAULT_ALLOWED_HOST =
  "invoicepilot-deadbolt-demo.vercel.app";
const MAX_BODY_BYTES = 256_000;
const MAX_OWNERSHIP_BYTES = 16_000;
const REQUEST_TIMEOUT_MS = 6_000;

export const LiveVerificationRequestSchema = z
  .object({
    url: z.string().url().max(500),
    ownershipToken: z.string().min(16).max(180),
    ownershipConfirmed: z.literal(true),
  })
  .strict();

export const LiveCheckSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    status: z.enum(["confirmed", "not_confirmed", "inconclusive"]),
    findingId: z.string(),
    evidence: z.string(),
  })
  .strict();

export const LiveVerificationResultSchema = z
  .object({
    target: z.string().url(),
    ownershipVerified: z.literal(true),
    verifiedAt: z.string(),
    checks: z.array(LiveCheckSchema).length(4),
  })
  .strict();

export type LiveVerificationResult = z.infer<
  typeof LiveVerificationResultSchema
>;

function allowedHosts() {
  return new Set(
    (
      process.env.DEADBOLT_LIVE_VERIFY_HOSTS ?? DEFAULT_ALLOWED_HOST
    )
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  );
}

function normalizeOwnedTarget(rawUrl: string) {
  const target = new URL(rawUrl);
  const hostname = target.hostname.toLowerCase();

  if (
    target.protocol !== "https:" ||
    target.username ||
    target.password ||
    (target.port && target.port !== "443") ||
    !allowedHosts().has(hostname)
  ) {
    throw new Error(
      "This deployment is not on the server’s exact owned-host allowlist.",
    );
  }

  target.hostname = hostname;
  target.port = "";
  target.pathname = "/";
  target.search = "";
  target.hash = "";
  return target;
}

async function readBoundedBody(response: Response, maxBytes: number) {
  const declaredLength = Number(
    response.headers.get("content-length") ?? 0,
  );
  if (declaredLength > maxBytes) {
    throw new Error("The staging response exceeded the verification limit.");
  }

  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error("The staging response exceeded the verification limit.");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

async function boundedFetch(
  url: URL,
  maxBytes = MAX_BODY_BYTES,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "manual",
      headers: {
        "User-Agent": "Deadbolt-Defensive-Verifier/1.0",
        Accept: "application/json, text/plain;q=0.8, */*;q=0.2",
      },
      signal: controller.signal,
    });

    if (response.status >= 300 && response.status < 400) {
      throw new Error("Redirects are disabled for live verification.");
    }

    return {
      response,
      body: await readBoundedBody(response, maxBytes),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function check(
  id: string,
  label: string,
  findingId: string,
  confirmed: boolean | null,
  evidence: string,
) {
  return {
    id,
    label,
    findingId,
    status:
      confirmed === null
        ? ("inconclusive" as const)
        : confirmed
          ? ("confirmed" as const)
          : ("not_confirmed" as const),
    evidence,
  };
}

export async function verifyOwnedStaging(
  input: z.infer<typeof LiveVerificationRequestSchema>,
): Promise<LiveVerificationResult> {
  const target = normalizeOwnedTarget(input.url);
  const ownershipUrl = new URL(
    "/.well-known/deadbolt-verification.json",
    target,
  );
  const ownership = await boundedFetch(
    ownershipUrl,
    MAX_OWNERSHIP_BYTES,
  );

  if (!ownership.response.ok) {
    throw new Error("The ownership verification file was not reachable.");
  }

  let ownershipPayload: unknown;
  try {
    ownershipPayload = JSON.parse(ownership.body);
  } catch {
    throw new Error("The ownership verification file is not valid JSON.");
  }

  const ownershipSchema = z
    .object({ token: z.string() })
    .passthrough();
  const parsedOwnership = ownershipSchema.parse(ownershipPayload);
  if (parsedOwnership.token !== input.ownershipToken) {
    throw new Error("The staging ownership token did not match.");
  }

  const [root, cors, invoice, verboseError] = await Promise.all([
    boundedFetch(new URL("/", target)),
    boundedFetch(new URL("/api/invoices", target)),
    boundedFetch(new URL("/api/invoices/2044", target)),
    boundedFetch(
      new URL("/api/reports/export?format=broken", target),
    ),
  ]);

  const missingHeaders = [
    "content-security-policy",
    "x-content-type-options",
    "referrer-policy",
    "x-frame-options",
  ].filter((header) => !root.response.headers.has(header));
  const corsOrigin =
    cors.response.headers.get("access-control-allow-origin");

  let invoiceOwner: string | null = null;
  try {
    const payload = JSON.parse(invoice.body) as {
      invoice?: { ownerId?: string };
    };
    invoiceOwner = payload.invoice?.ownerId ?? null;
  } catch {
    invoiceOwner = null;
  }

  let errorKeys: string[] = [];
  try {
    const payload = JSON.parse(verboseError.body) as Record<string, unknown>;
    errorKeys = Object.keys(payload);
  } catch {
    errorKeys = [];
  }

  return LiveVerificationResultSchema.parse({
    target: target.toString(),
    ownershipVerified: true,
    verifiedAt: new Date().toISOString(),
    checks: [
      check(
        "headers",
        "Browser security headers",
        "IP-008",
        root.response.ok ? missingHeaders.length > 0 : null,
        root.response.ok
          ? missingHeaders.length > 0
            ? `Missing on the live root response: ${missingHeaders.join(", ")}.`
            : "The required response headers were present."
          : `Root response returned HTTP ${root.response.status}.`,
      ),
      check(
        "cors",
        "API cross-origin policy",
        "IP-005",
        cors.response.ok ? corsOrigin === "*" : null,
        cors.response.ok
          ? corsOrigin === "*"
            ? "The live invoice API returns Access-Control-Allow-Origin: *."
            : `The live API returned origin policy ${corsOrigin ?? "(none)"}.`
          : `Invoice API returned HTTP ${cors.response.status}.`,
      ),
      check(
        "ownership",
        "Cross-tenant invoice access",
        "IP-003",
        invoice.response.ok ? invoiceOwner === "user_omar_02" : null,
        invoice.response.ok
          ? invoiceOwner === "user_omar_02"
            ? "Anonymous invoice 2044 returned Omar’s synthetic tenant record."
            : "Invoice 2044 did not return the seeded cross-tenant owner."
          : `Invoice detail returned HTTP ${invoice.response.status}.`,
      ),
      check(
        "errors",
        "Production error disclosure",
        "IP-006",
        verboseError.response.status === 500
          ? errorKeys.some((key) =>
              ["stack", "environment"].includes(key),
            )
          : null,
        verboseError.response.status === 500
          ? `The live 500 response exposes keys: ${errorKeys.join(", ") || "(none)"}.`
          : `Broken export returned HTTP ${verboseError.response.status}.`,
      ),
    ],
  });
}
