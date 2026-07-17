const base = (process.env.BASE_URL ?? "http://127.0.0.1:3101").replace(/\/$/, "");
const checks = [];

function expect(name, condition) {
  if (!condition) {
    throw new Error(name);
  }

  checks.push(name);
}

const home = await fetch(base);
const homeText = await home.text();
expect(
  "dashboard renders",
  home.status === 200 && homeText.includes("InvoicePilot"),
);

const crossTenantPage = await fetch(`${base}/invoice/2044`);
const crossTenantText = await crossTenantPage.text();
expect(
  "cross-tenant invoice page is exposed",
  crossTenantPage.status === 200 && crossTenantText.includes("Helio Health"),
);

const invoiceList = await fetch(`${base}/api/invoices`);
const invoiceListBody = await invoiceList.json();
expect(
  "invoice API returns all tenants",
  invoiceListBody.invoices.length === 6 &&
    invoiceListBody.invoices.some(
      (invoice) => invoice.ownerId !== "user_maya_01",
    ),
);
expect(
  "API wildcard CORS is active",
  invoiceList.headers.get("access-control-allow-origin") === "*",
);
expect(
  "security headers are absent",
  !invoiceList.headers.has("content-security-policy") &&
    !invoiceList.headers.has("x-frame-options"),
);

const directInvoice = await fetch(`${base}/api/invoices/2044`);
const directInvoiceBody = await directInvoice.json();
expect(
  "IDOR API exposes another owner",
  directInvoice.status === 200 &&
    directInvoiceBody.invoice.ownerId === "user_omar_02",
);

let cookie = "";
for (let attempt = 0; attempt < 5; attempt += 1) {
  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "maya@northstar.test",
      password: "invoicepilot-demo",
    }),
  });
  expect(`login attempt ${attempt + 1} is not rate limited`, login.status === 200);
  cookie = login.headers.get("set-cookie") ?? cookie;
}
expect(
  "login issues a demo session cookie",
  cookie.includes("invoicepilot_session="),
);

const logout = await fetch(`${base}/api/auth/logout`, {
  method: "POST",
  headers: { cookie },
});
expect(
  "logout leaves session cookie untouched",
  logout.status === 200 && !logout.headers.has("set-cookie"),
);

const brokenExport = await fetch(
  `${base}/api/reports/export?invoice=2044&format=broken`,
);
const brokenBody = await brokenExport.json();
expect(
  "error response leaks stack and environment",
  brokenExport.status === 500 &&
    typeof brokenBody.stack === "string" &&
    typeof brokenBody.environment === "string",
);

for (const name of checks) {
  console.log(`✓ ${name}`);
}
console.log(`✓ ${checks.length} runtime assertions passed against ${base}`);
