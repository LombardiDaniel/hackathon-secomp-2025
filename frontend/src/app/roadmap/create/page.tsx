"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { readUsernameCookie } from "../../../libs/auth";
import { postRoadmapPrompt } from "../../../libs/roadmapService";

export default function CreateRoadmapPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const stored = readUsernameCookie();
    if (!stored) {
      router.replace("/");
      return;
    }
    setUsername(stored);
  }, [router]);

  const handleSubmit = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!prompt.trim()) {
      setError("Tell us what you want to study so we can generate a roadmap.");
      return;
    }

    if (!username) {
      setError("Please sign in again to continue.");
      router.replace("/");
      return;
    }

    setLoading(true);
    try {
      const response = await postRoadmapPrompt({ prompt, username });
      if (!response.success) {
        setError("We couldn't create a roadmap right now. Please try again.");
        return;
      }

      setSuccessMessage("Awesome! We'll craft this roadmap and notify you when it's ready.");
      setPrompt("");
    } catch (err) {
      console.error(err);
      setError("Unexpected error while creating the roadmap. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }, [prompt, router, username]);

  return (
    <div className="min-h-screen bg-[var(--color-mist)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-sky)]/50 via-transparent to-[var(--color-ocean)]/40" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl rounded-3xl bg-white/85 backdrop-blur px-8 py-10 shadow-2xl border border-white/70 space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-slate)]/60">Create roadmap</p>
          <h1 className="text-2xl font-semibold text-[var(--color-slate)]">What do you want to master next?</h1>
          <p className="text-sm text-[var(--color-slate)]/70">
            Describe goals, timeline, or skills you're aiming for. We'll send this prompt to the AI planner when the backend is ready.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-xs font-medium uppercase tracking-wide text-[var(--color-slate)]/70">
              Your learning prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows={6}
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
              placeholder="Ex: I want a 6-week plan to learn data engineering basics while working full-time."
              className="w-full rounded-2xl border border-[var(--color-sky)]/70 bg-white px-4 py-3 text-sm text-[var(--color-slate)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-ocean)]"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-[var(--color-amber)]/50 bg-[var(--color-amber)]/20 px-4 py-3 text-xs text-[var(--color-amber)]">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-[var(--color-ocean)]/40 bg-[var(--color-ocean)]/15 px-4 py-3 text-xs text-[var(--color-ocean)]">
              {successMessage}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="rounded-xl border border-[var(--color-sky)]/60 px-4 py-2 text-sm font-medium text-[var(--color-slate)] hover:bg-[var(--color-sky)]/30 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-ocean)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--color-ocean)]/30 hover:bg-[var(--color-slate)] transition disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Sending…" : "Send to AI"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
