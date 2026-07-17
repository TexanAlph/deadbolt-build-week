import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  currentUser,
  formatCurrency,
  getInvoiceById,
} from "@/lib/data";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = getInvoiceById(Number(id));

  if (!invoice) {
    notFound();
  }

  const subtotal = invoice.lineItems.reduce(
    (sum, line) => sum + line.quantity * line.rate,
    0,
  );

  return (
    <AppShell>
      <main className="invoice-page">
        <div className="invoice-toolbar">
          <div>
            <Link href="/">← Back to invoices</Link>
            <h1>{invoice.number}</h1>
            <p>
              Viewing as {currentUser.email} · issued {invoice.issuedAt}
            </p>
          </div>
          <div className="toolbar-actions">
            <Link
              className="secondary-button"
              href={`/api/reports/export?invoice=${invoice.id}`}
            >
              Download PDF
            </Link>
            <button className="primary-button" type="button">
              Send reminder
            </button>
          </div>
        </div>

        <article className="invoice-document">
          <div className="document-header">
            <div>
              <span className="wordmark-mark large">IP</span>
              <p>INVOICE</p>
            </div>
            <div className="invoice-number">
              <span>Invoice number</span>
              <strong>{invoice.number}</strong>
            </div>
          </div>

          <div className="billing-grid">
            <div>
              <span>FROM</span>
              <strong>{currentUser.company}</strong>
              <p>{currentUser.name}</p>
              <p>{currentUser.email}</p>
            </div>
            <div>
              <span>BILL TO</span>
              <strong>{invoice.client}</strong>
              <p>{invoice.clientEmail}</p>
              <p>Fictional demo customer</p>
            </div>
            <div>
              <span>DUE</span>
              <strong>{invoice.dueAt}</strong>
              <p>Net 14</p>
            </div>
          </div>

          <div className="line-items">
            <div className="line-head">
              <span>Description</span>
              <span>Qty</span>
              <span>Rate</span>
              <span>Amount</span>
            </div>
            {invoice.lineItems.map((line) => (
              <div className="line-row" key={line.description}>
                <strong>{line.description}</strong>
                <span>{line.quantity}</span>
                <span>{formatCurrency(line.rate)}</span>
                <strong>{formatCurrency(line.quantity * line.rate)}</strong>
              </div>
            ))}
          </div>

          <div className="invoice-total">
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>$0</strong>
            </div>
            <div className="grand-total">
              <span>Amount due</span>
              <strong>{formatCurrency(invoice.amount)}</strong>
            </div>
          </div>

          <p className="invoice-note">
            Thanks for the work together. Please include {invoice.number} with
            your payment.
          </p>
        </article>
      </main>
    </AppShell>
  );
}
