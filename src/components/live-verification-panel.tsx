"use client";

import { useState } from "react";
import type { LiveVerificationResult } from "@/lib/live-verification";

const DEMO_URL = "https://invoicepilot-deadbolt-demo.vercel.app";
const DEMO_TOKEN = "deadbolt-invoicepilot-owned-demo-v1";

export function LiveVerificationPanel() {
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [state, setState] = useState<
    "idle" | "running" | "complete" | "error"
  >("idle");
  const [result, setResult] = useState<LiveVerificationResult | null>(
    null,
  );
  const [error, setError] = useState("");

  async function runVerification() {
    if (!ownershipConfirmed) {
      setError("Confirm that you own or are authorized to verify this staging app.");
      return;
    }

    setState("running");
    setResult(null);
    setError("");

    try {
      const request = await fetch("/api/verify-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: DEMO_URL,
          ownershipToken: DEMO_TOKEN,
          ownershipConfirmed: true,
        }),
      });
      const payload = (await request.json()) as {
        result?: LiveVerificationResult;
        error?: { message?: string };
      };

      if (!request.ok || !payload.result) {
        throw new Error(
          payload.error?.message ?? "The staging check did not return a result.",
        );
      }

      setResult(payload.result);
      setState("complete");
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "The staging check could not be completed.",
      );
      setState("error");
    }
  }

  return (
    <section className="live-verification">
      <div className="report-section-heading compact">
        <div>
          <p className="eyebrow">OPTIONAL DEPTH · OWNED STAGING</p>
          <h2>Prove the seeded risks on the live demo.</h2>
        </div>
        <p>
          This is a bounded defensive check, not a pentest: one exact
          allowlisted HTTPS host, a matching ownership file, no redirects, four
          known synthetic routes, and strict response limits.
        </p>
      </div>

      <div className="live-verification-controls">
        <div>
          <span>ALLOWLISTED TARGET</span>
          <a href={DEMO_URL}>{DEMO_URL}</a>
          <small>
            The source report proves the sandboxed fixes. This live pass proves
            the intentionally vulnerable “before” deployment.
          </small>
        </div>
        <label className="ownership-check">
          <input
            type="checkbox"
            checked={ownershipConfirmed}
            onChange={(event) =>
              setOwnershipConfirmed(event.target.checked)
            }
          />
          <span>
            I own or am authorized to verify this synthetic staging target.
          </span>
        </label>
        <button
          type="button"
          onClick={runVerification}
          disabled={state === "running"}
        >
          {state === "running" ? "VERIFYING…" : "VERIFY OWNED STAGING"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>

      {error ? (
        <p className="analysis-error" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="live-check-grid" aria-live="polite">
          {result.checks.map((item) => (
            <article key={item.id} className={item.status}>
              <div>
                <span>{item.findingId}</span>
                <strong>{item.status.replace("_", " ")}</strong>
              </div>
              <h3>{item.label}</h3>
              <p>{item.evidence}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="live-verification-empty">
          <span>OWNERSHIP FILE → BOUNDED REQUESTS → EVIDENCE</span>
          <p>No network request runs until the ownership box is checked.</p>
        </div>
      )}
    </section>
  );
}
