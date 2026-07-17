import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  formatCurrency,
  getCurrentUserInvoices,
  InvoiceStatus,
} from "@/lib/data";

const statusLabels: Record<InvoiceStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  draft: "Draft",
};

export default function Dashboard() {
  const invoices = getCurrentUserInvoices();
  const outstanding = invoices
    .filter((invoice) => invoice.status === "pending")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <AppShell>
      <main className="dashboard">
        <div className="page-topline">
          <div>
            <p className="kicker">FRIDAY, JULY 17</p>
            <h1>Good afternoon, Maya.</h1>
            <p>Here&apos;s how your business is moving this month.</p>
          </div>
          <Link className="new-invoice" href="/invoice/1026">
            <span aria-hidden="true">＋</span>
            New invoice
          </Link>
        </div>

        <section className="metric-grid" aria-label="Business summary">
          <article className="metric-card primary-metric">
            <div className="metric-label">
              <span>Outstanding</span>
              <span className="trend">↑ 8.2%</span>
            </div>
            <strong>{formatCurrency(outstanding)}</strong>
            <p>Across 1 open invoice</p>
            <div className="sparkline" aria-hidden="true">
              {[18, 28, 23, 42, 38, 55, 64, 52, 72, 78, 69, 88].map(
                (height, index) => (
                  <span key={index} style={{ height: `${height}%` }} />
                ),
              )}
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-label">
              <span>Paid this month</span>
              <span className="soft-badge">ON TRACK</span>
            </div>
            <strong>{formatCurrency(paid)}</strong>
            <p>1 payment received</p>
            <div className="progress">
              <span style={{ width: "64%" }} />
            </div>
            <small>64% of July goal</small>
          </article>

          <article className="metric-card">
            <div className="metric-label">
              <span>Avg. time to pay</span>
              <span className="muted-icon">···</span>
            </div>
            <strong>
              6.4 <em>days</em>
            </strong>
            <p>2.1 days faster than June</p>
            <div className="mini-bars" aria-hidden="true">
              <span style={{ height: "38%" }} />
              <span style={{ height: "72%" }} />
              <span style={{ height: "52%" }} />
              <span style={{ height: "84%" }} />
              <span style={{ height: "61%" }} />
            </div>
          </article>
        </section>

        <section className="invoice-panel" id="invoices">
          <div className="panel-heading">
            <div>
              <h2>Recent invoices</h2>
              <p>Keep an eye on every dollar in motion.</p>
            </div>
            <Link href="/api/invoices">View all</Link>
          </div>

          <div className="invoice-table">
            <div className="table-head">
              <span>Client</span>
              <span>Invoice</span>
              <span>Due date</span>
              <span>Status</span>
              <span>Amount</span>
              <span />
            </div>
            {invoices.map((invoice) => (
              <Link
                className="invoice-row"
                href={`/invoice/${invoice.id}`}
                key={invoice.id}
              >
                <span className="client-cell">
                  <span className="avatar">{invoice.clientInitials}</span>
                  <span>
                    <strong>{invoice.client}</strong>
                    <small>{invoice.description}</small>
                  </span>
                </span>
                <span>{invoice.number}</span>
                <span>{invoice.dueAt}</span>
                <span>
                  <span className={`status ${invoice.status}`}>
                    <i />
                    {statusLabels[invoice.status]}
                  </span>
                </span>
                <strong>{formatCurrency(invoice.amount)}</strong>
                <span className="row-arrow">↗</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bottom-grid">
          <article className="cash-card">
            <p className="kicker">CASH FLOW</p>
            <h2>Momentum, at a glance.</h2>
            <div className="cash-chart" aria-hidden="true">
              {[34, 46, 42, 58, 55, 70, 82, 76, 91, 86, 100, 96].map(
                (height, index) => (
                  <span key={index} style={{ height: `${height}%` }} />
                ),
              )}
            </div>
            <div className="month-labels">
              <span>APR</span>
              <span>MAY</span>
              <span>JUN</span>
              <span>JUL</span>
            </div>
          </article>

          <article className="tip-card">
            <span className="tip-icon">✦</span>
            <p className="kicker">PILOT TIP</p>
            <h2>Follow up while the work is still fresh.</h2>
            <p>
              Invoices reminded within 3 days are typically paid 28% faster.
            </p>
            <button type="button">Set smart reminders</button>
          </article>
        </section>
      </main>
    </AppShell>
  );
}
