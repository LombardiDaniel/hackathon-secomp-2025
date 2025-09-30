"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { searchRoadmapSummaries, type RoadmapSummary } from "../../data/roadmaps";
import { readUsernameCookie } from "../../libs/auth";
import { RoadmapCard } from "../../components/roadmap/RoadmapCard";

export default function SearchPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<RoadmapSummary[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [initialized, setInitialized] = React.useState(false);

  const performSearch = React.useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
  const response = await searchRoadmapSummaries(term);
      setResults(response);
    } catch (err) {
      console.error(err);
      setError("We couldn't fetch search results right now. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const stored = readUsernameCookie();
    if (!stored) {
      router.replace("/");
      return;
    }
    setUsername(stored);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get("q") ?? "";
      setQuery(initialQuery);
      performSearch(initialQuery);
      setInitialized(true);
    }
  }, [router, performSearch]);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.replace(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    setQuery(trimmed);
    performSearch(trimmed);
  }, [query, performSearch, router]);

  const openRoadmap = React.useCallback((id: string) => {
    router.push(`/roadmap?roadmapId=${encodeURIComponent(id)}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-mist)] text-[var(--color-slate)]">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/85 border-b border-white/70">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/home")}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-[var(--color-sky)]/60 bg-white px-3 py-2 text-xs font-medium text-[var(--color-slate)] hover:bg-[var(--color-sky)]/30 transition"
          >
            ← Home
          </button>
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)]/40">🔍</span>
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search roadmaps by title, topic, or tags"
                className="w-full rounded-xl bg-[var(--color-sky)]/20 border border-[var(--color-sky)]/50 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ocean)]"
              />
            </div>
          </form>
          <div className="hidden sm:flex flex-col text-right text-xs text-[var(--color-slate)]/60 leading-tight">
            <span>Signed in as</span>
            <span className="text-[var(--color-slate)] font-medium">{username ?? "Loading"}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Search results</h1>
          <p className="text-sm text-[var(--color-slate)]/70">
            {query ? `Showing matches for "${query}"` : "Trending roadmaps you might like"}
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/70 bg-white/70 px-6 py-6 text-sm text-[var(--color-slate)]/70">
            Fetching roadmaps...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-[var(--color-amber)]/50 bg-[var(--color-amber)]/15 px-6 py-4 text-sm text-[var(--color-amber)]">
            {error}
          </div>
        )}

        {!loading && !error && initialized && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-sky)]/60 bg-white/60 px-6 py-10 text-center text-sm text-[var(--color-slate)]/60">
                No roadmaps found for "{query}" yet. Try adjusting your search or create your own roadmap.
              </div>
            ) : (
              results.map(roadmap => (
                <RoadmapCard key={roadmap.id} summary={roadmap} onOpen={openRoadmap} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
