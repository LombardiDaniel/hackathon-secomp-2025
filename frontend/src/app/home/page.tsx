"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  favoriteRoadmaps,
  popularRoadmapsThisWeek,
  recentRoadmaps,
  type RoadmapSummary
} from "../../data/roadmaps";
import { readUsernameCookie } from "../../libs/auth";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);

const formatRelativeDate = (isoDate: string) => {
  const delta = Date.now() - new Date(isoDate).getTime();
  const days = Math.round(delta / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
};

const RoadmapCard: React.FC<{ summary: RoadmapSummary; onOpen: (id: string) => void }> = ({ summary, onOpen }) => (
  <button
    onClick={() => onOpen(summary.id)}
    className="w-full text-left rounded-2xl bg-white/95 backdrop-blur shadow hover:shadow-lg transition border border-white/60 px-5 py-4 space-y-3"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-[var(--color-slate)]">{summary.title}</h3>
        <p className="mt-1 text-sm text-[var(--color-slate)]/70 line-clamp-2">{summary.description}</p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-ocean)]/15 text-[var(--color-ocean)] text-xs font-semibold px-2.5 py-1">
        ▲ {formatNumber(summary.upvotes)}
      </span>
    </div>
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-slate)]/60">
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-sky)]/30 px-2 py-0.5">
        ⏱️ {summary.estimatedWeeks} weeks
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-sky)]/30 px-2 py-0.5">
        🔄 Updated {formatRelativeDate(summary.lastUpdated)}
      </span>
      {summary.tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--color-mist)] px-2 py-0.5 text-[var(--color-slate)]/70"
        >
          #{tag}
        </span>
      ))}
    </div>
  </button>
);

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
            <div className="text-[11px] text-[var(--color-slate)]/60">Updated {formatRelativeDate(item.lastUpdated)}</div>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const stored = readUsernameCookie();
    if (!stored) {
      router.replace("/");
      return;
    }
    setUsername(stored);
  }, [router]);

  const filteredPopular = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return popularRoadmapsThisWeek;
    return popularRoadmapsThisWeek.filter(roadmap => roadmap.title.toLowerCase().includes(term));
  }, [search]);

  const openRoadmap = React.useCallback((id: string) => {
    router.push(`/roadmap?roadmapId=${encodeURIComponent(id)}`);
  }, [router]);

  const handleCreate = React.useCallback(() => {
    router.push("/roadmap?create=1");
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-mist)] text-[var(--color-slate)]">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-white/70">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs text-[var(--color-slate)]/60 uppercase tracking-wide">Roadmaps</div>
            <h1 className="text-lg font-semibold">Hi{username ? `, ${username}` : " there"}</h1>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)]/40">🔍</span>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="w-full rounded-xl bg-[var(--color-sky)]/20 border border-[var(--color-sky)]/50 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ocean)]"
                placeholder="Search roadmaps"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-ocean)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[var(--color-ocean)]/30 hover:bg-[var(--color-slate)] transition"
          >
            ➕ Create roadmap
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-6">
          <SidebarList title="Favorites" items={favoriteRoadmaps} onOpen={openRoadmap} />
          <SidebarList title="Recent" items={recentRoadmaps} onOpen={openRoadmap} />
        </aside>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-slate)]/60">Popular this week</h2>
          <div className="space-y-4">
            {filteredPopular.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-sky)]/60 bg-white/60 px-6 py-10 text-center text-sm text-[var(--color-slate)]/60">
                No roadmaps match "{search}" yet. Try a different search or create a new roadmap.
              </div>
            ) : (
              filteredPopular.map(roadmap => (
                <RoadmapCard key={roadmap.id} summary={roadmap} onOpen={openRoadmap} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
