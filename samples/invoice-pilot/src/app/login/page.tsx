import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-brand">
        <Link className="wordmark light" href="/">
          <span className="wordmark-mark">IP</span>
          <span>InvoicePilot</span>
        </Link>
        <div>
          <p className="kicker">MONEY IN MOTION</p>
          <h1>Invoices that follow through.</h1>
          <p>
            Send polished work, stay ahead of cash flow, and keep every client
            relationship moving.
          </p>
        </div>
        <small>All data in this demo is synthetic.</small>
      </section>
      <section className="login-panel">
        <div>
          <p className="kicker">WELCOME BACK</p>
          <h2>Sign in to your workspace</h2>
          <p>Use the pre-filled demo account to continue.</p>
          <LoginForm />
          <Link className="back-link" href="/">
            Continue without signing in
          </Link>
        </div>
      </section>
    </main>
  );
}
