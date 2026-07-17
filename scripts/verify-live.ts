import assert from "node:assert/strict";
import {
  LiveVerificationResultSchema,
  verifyOwnedStaging,
} from "../src/lib/live-verification";

const originalFetch = globalThis.fetch;

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

async function main() {
  const requested: string[] = [];
  globalThis.fetch = async (input) => {
    const url = new URL(
      typeof input === "string" || input instanceof URL
        ? input.toString()
        : input.url,
    );
    requested.push(url.toString());

    if (url.pathname === "/.well-known/deadbolt-verification.json") {
      return json({
        token: "deadbolt-invoicepilot-owned-demo-v1",
      });
    }

    if (url.pathname === "/") {
      return new Response("<main>InvoicePilot</main>", { status: 200 });
    }

    if (url.pathname === "/api/invoices") {
      return json(
        { invoices: [] },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    if (url.pathname === "/api/invoices/2044") {
      return json({ invoice: { ownerId: "user_omar_02" } });
    }

    if (url.pathname === "/api/reports/export") {
      return json(
        {
          message: "internal path",
          stack: "synthetic stack",
          environment: "production",
        },
        { status: 500 },
      );
    }

    return new Response("Not found", { status: 404 });
  };

  const result = await verifyOwnedStaging({
    url: "https://invoicepilot-deadbolt-demo.vercel.app",
    ownershipToken: "deadbolt-invoicepilot-owned-demo-v1",
    ownershipConfirmed: true,
  });
  LiveVerificationResultSchema.parse(result);
  assert.equal(result.ownershipVerified, true);
  assert.equal(result.checks.length, 4);
  assert(
    result.checks.every((check) => check.status === "confirmed"),
    "All four seeded live checks must be confirmed by the fixture responses.",
  );
  assert.equal(requested.length, 5);

  await assert.rejects(
    () =>
      verifyOwnedStaging({
        url: "https://example.com",
        ownershipToken: "deadbolt-invoicepilot-owned-demo-v1",
        ownershipConfirmed: true,
      }),
    /allowlist/,
  );

  console.log(
    "✓ Live verifier contract verified: exact host, ownership token, bounded seeded checks, safe result schema",
  );
}

void main().finally(() => {
  globalThis.fetch = originalFetch;
});
