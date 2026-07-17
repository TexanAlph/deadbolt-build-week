# InvoicePilot

InvoicePilot is a deliberately vulnerable, synthetic SaaS used to demonstrate Deadbolt's hunt → patch → re-test loop.

## Safety

- All people, companies, invoices, credentials, keys, and payments are fictional.
- The app has no database, payment processor, email provider, or other persistent integration.
- Do not reuse this code in production. It intentionally demonstrates unsafe patterns.
- The deployed endpoints expose synthetic records only.

## Run

```bash
npm install
npm run dev
```

The app runs at http://localhost:3101.

Demo sign-in:

- Email: `maya@northstar.test`
- Password: `invoicepilot-demo`

## Seed verification

```bash
npm run check
npm run verify:runtime
```

The ground-truth vulnerability contract is documented in
`VULNERABILITY_MANIFEST.json`. The check command verifies linting, types, all
eight planted seeds, a production build, and the client-bundle exposure. With
the dev server running, `verify:runtime` exercises the planted behavior against
`BASE_URL` (default: `http://127.0.0.1:3101`).
