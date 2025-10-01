"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { fetchRoadmapSummaries, type RoadmapSummary } from "../../data/roadmaps";
import { readUsernameCookie } from "../../libs/auth";
import { formatRelativeDate } from "../../libs/date";
import { RoadmapCard } from "../../components/roadmap/RoadmapCard";

const SidebarList: React.FC<{ title: string; items: RoadmapSummary[]; onOpen: (id: string) => void }> = ({ title, items, onOpen }) => (
  <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur shadow-sm">
    <div className="border-b border-white/70 px-4 py-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-slate)]/60">{title}</h2>
    </div>
    <ul className="px-3 py-3 space-y-2">
      {items.map(item => (
        <li key={item.id}>
          <button
            onClick={() => onOpen(item.id)}
            className="w-full text-left rounded-xl px-3 py-2 hover:bg-[var(--color-sky)]/20 transition"
          >
            <div className="text-sm font-medium text-[var(--color-slate)] line-clamp-1">{item.title}</div>
            <div className="text-[11px] text-[var(--color-slate)]/60">Updated {item.lastUpdated ? formatRelativeDate(item.lastUpdated) : "recently"}</div>
          </button>
        </li>
      ))}
      {items.length === 0 && (
        <li className="text-center text-[11px] text-[var(--color-slate)]/50 py-2">No items yet</li>
      )}
    </ul>
  </div>
);

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [roadmaps, setRoadmaps] = React.useState<RoadmapSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const stored = readUsernameCookie();
    if (!stored) {
      router.replace("/");
      return;
    }
    setUsername(stored);
  }, [router]);

  React.useEffect(() => {
    let cancelled = false;

    const loadRoadmaps = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRoadmapSummaries();
        if (!cancelled) {
          setRoadmaps(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("We couldn't load roadmaps right now. Please try again soon.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRoadmaps();

    return () => {
      cancelled = true;
    };
  }, []);

  const openRoadmap = React.useCallback((id: string) => {
    router.push(`/roadmap?roadmapId=${encodeURIComponent(id)}`);
  }, [router]);

  const handleCreate = React.useCallback(() => {
    router.push("/roadmap/create");
  }, [router]);

  const handleSearchSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = search.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }, [router, search]);

  const favorites = React.useMemo(() => roadmaps.slice(0, 3), [roadmaps]);
  const recent = React.useMemo(() => {
    return [...roadmaps]
      .sort((a, b) => {
        const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [roadmaps]);
  const popular = roadmaps;

  return (
    <div className="min-h-screen bg-[var(--color-mist)] text-[var(--color-slate)]">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-white/70">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs text-[var(--color-slate)]/60 uppercase tracking-wide">Roadmaps</div>
            <h1 className="text-lg font-semibold">Hi{username ? `, ${username}` : " there"}</h1>
          </div>
          <form className="flex-1 max-w-md" onSubmit={handleSearchSubmit}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)]/40">🔍</span>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="w-full rounded-xl bg-[var(--color-sky)]/20 border border-[var(--color-sky)]/50 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ocean)]"
                placeholder="Search roadmaps"
              />
            </div>
          </form>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-ocean)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[var(--color-ocean)]/30 hover:bg-[var(--color-slate)] transition"
          >
            ✨ Create roadmap
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-6">
          <SidebarList title="Favorites" items={favorites} onOpen={openRoadmap} />
          <SidebarList title="Recent" items={recent} onOpen={openRoadmap} />
        </aside>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-slate)]/60">Popular this week</h2>
          {loading && (
            <div className="rounded-2xl border border-white/70 bg-white/70 px-6 py-6 text-sm text-[var(--color-slate)]/70">
              Loading roadmaps...
            </div>
          )}
          {error && !loading && (
            <div className="rounded-2xl border border-[var(--color-amber)]/50 bg-[var(--color-amber)]/15 px-6 py-4 text-sm text-[var(--color-amber)]">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="space-y-4">
              {popular.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--color-sky)]/60 bg-white/60 px-6 py-10 text-center text-sm text-[var(--color-slate)]/60">
                  No roadmaps available yet. Check back soon!
                </div>
              ) : (
                popular.map(roadmap => (
                  <RoadmapCard key={roadmap.id} summary={roadmap} onOpen={openRoadmap} />
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
