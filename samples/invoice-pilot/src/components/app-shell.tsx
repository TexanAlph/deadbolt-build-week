import Link from "next/link";
import { ReactNode } from "react";
import { currentUser } from "@/lib/data";
import { ProviderStatus } from "@/components/provider-status";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark">IP</span>
          <span>InvoicePilot</span>
        </Link>

        <nav aria-label="Primary navigation">
          <p>Workspace</p>
          <Link className="nav-item active" href="/">
            <span aria-hidden="true">⌂</span>
            Overview
          </Link>
          <Link className="nav-item" href="/#invoices">
            <span aria-hidden="true">▤</span>
            Invoices
          </Link>
          <Link className="nav-item" href="/#clients">
            <span aria-hidden="true">◎</span>
            Clients
          </Link>
          <Link className="nav-item" href="/#reports">
            <span aria-hidden="true">↗</span>
            Reports
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <ProviderStatus />
          <div className="account">
            <span className="avatar small">{currentUser.initials}</span>
            <div>
              <strong>{currentUser.name}</strong>
              <span>{currentUser.company}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="mobile-header">
          <Link className="wordmark" href="/">
            <span className="wordmark-mark">IP</span>
            <span>InvoicePilot</span>
          </Link>
          <span className="avatar small">{currentUser.initials}</span>
        </header>
        {children}
      </div>
    </div>
  );
}
