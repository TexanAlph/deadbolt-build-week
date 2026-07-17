"use client";

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
}
