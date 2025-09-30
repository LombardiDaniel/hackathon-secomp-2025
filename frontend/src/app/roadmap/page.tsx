"use client";

import React from "react";
import sampleRoadmapRaw from "../../data/example.json";
import { RoadmapSchema, type Roadmap } from "../../types/roadmap";
import { RoadmapFlow } from "../../components/roadmap/RoadmapFlow";
import { useRouter, useSearchParams } from "next/navigation";
import { readUsernameCookie } from "../../libs/auth";
import { popularRoadmapsThisWeek } from "../../data/roadmaps";

export default function RoadmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = React.useState<string | null>(null);

  const roadmap = React.useMemo(() => {
    const parsed = RoadmapSchema.safeParse(sampleRoadmapRaw);
    if (!parsed.success) {
      console.error(parsed.error.flatten());
      return null;
    }
    return parsed.data as Roadmap;
  }, []);

  React.useEffect(() => {
    const stored = readUsernameCookie();
    if (!stored) {
      router.replace("/");
      return;
    }
    setUsername(stored);
  }, [router]);

  const selectedRoadmapId = searchParams.get("roadmapId");
  const isSampleRoadmap = !selectedRoadmapId || selectedRoadmapId === roadmap?.id;
  const selectedSummary = React.useMemo(() => {
    if (!selectedRoadmapId) return null;
    return popularRoadmapsThisWeek.find(item => item.id === selectedRoadmapId) ?? null;
  }, [selectedRoadmapId]);

  if (!roadmap) {
    return <div className="p-4 text-red-600 font-mono text-sm">Invalid sample JSON (see console).</div>;
  }

  if (!isSampleRoadmap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--color-mist)] text-[var(--color-slate)]">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-semibold">Roadmap coming soon</h1>
          <p className="text-sm text-[var(--color-slate)]/70">
            We don't have the content for <strong>{selectedSummary?.title ?? selectedRoadmapId}</strong> yet. Check back soon or explore another roadmap.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/home")}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[var(--color-slate)] border border-[var(--color-sky)]/60 hover:bg-[var(--color-sky)]/30 transition"
          >
            Back to home
          </button>
          <button
            onClick={() => router.push("/roadmap")}
            className="rounded-xl bg-[var(--color-ocean)] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[var(--color-slate)] transition"
          >
            View sample roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="px-4 py-2 bg-white border-b flex items-center justify-between">
        <h1 className="font-semibold text-sm">Roadmap Graph MVP</h1>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {username && <span className="text-[var(--color-slate)]/70">Hi, {username}</span>}
          <span>{roadmap.title}</span>
        </div>
      </header>
      <div className="flex-1">
        <RoadmapFlow roadmap={roadmap} />
      </div>
    </div>
  );
}
