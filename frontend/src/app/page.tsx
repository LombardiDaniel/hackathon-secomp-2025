"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { mockAuthenticate, readUsernameCookie, writeUsernameCookie } from "../libs/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const existing = readUsernameCookie();
    if (existing) {
      router.replace("/roadmap");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username to continue.");
      return;
    }

    setLoading(true);
    try {
      const result = await mockAuthenticate(trimmed);
      if (!result.success) {
        setError("We couldn't sign you in. Please try again.");
        return;
      }

      writeUsernameCookie(trimmed);
      router.push("/roadmap");
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-mist)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-sky)]/60 via-transparent to-[var(--color-ocean)]/50" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="rounded-2xl border border-[var(--color-sky)]/80 bg-white/80 backdrop-blur shadow-xl px-7 py-10 space-y-6">
          <div className="space-y-2 text-center">
            <span className="inline-flex items-center justify-center rounded-full bg-[var(--color-ocean)]/15 text-[var(--color-ocean)] text-xs font-semibold px-3 py-1">
              Roadmap Studio
            </span>
            <h1 className="text-2xl font-semibold text-[var(--color-slate)]">Welcome back</h1>
            <p className="text-sm text-[var(--color-slate)]/70">
              Sign in with a username to continue crafting your learning path.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="text-left space-y-2">
              <label htmlFor="username" className="text-xs font-medium uppercase tracking-wide text-[var(--color-slate)]/75">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={event => setUsername(event.target.value)}
                className="w-full rounded-xl border border-[var(--color-sky)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ocean)] focus:border-transparent placeholder:text-[var(--color-slate)]/40"
                placeholder="Your display name"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-[var(--color-amber)]/50 bg-[var(--color-amber)]/15 px-3 py-2 text-xs text-[var(--color-amber)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--color-ocean)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-ocean)]/25 transition hover:bg-[var(--color-slate)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-ocean)] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Continue"}
            </button>
          </form>

          <p className="text-[11px] text-[var(--color-slate)]/60 text-center">
            We’ll store this locally so you can personalize the roadmap. No password required for this MVP.
          </p>
        </div>
      </div>
    </div>
  );
}