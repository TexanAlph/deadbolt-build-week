"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const body = (await response.json()) as { message?: string };
    setMessage(
      response.ok
        ? "Signed in. Return to the dashboard."
        : body.message ?? "Sign-in failed.",
    );
    setLoading(false);
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label>
        Work email
        <input
          name="email"
          type="email"
          defaultValue="maya@northstar.test"
          autoComplete="email"
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          defaultValue="invoicepilot-demo"
          autoComplete="current-password"
        />
      </label>
      <button disabled={loading} type="submit">
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="form-message" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
