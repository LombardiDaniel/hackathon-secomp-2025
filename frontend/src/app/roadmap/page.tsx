"use client";

import React from "react";
import sampleRoadmapRaw from "../../data/example.json";
import { RoadmapSchema, type Roadmap } from "../../types/roadmap";
import { RoadmapFlow } from "../../components/roadmap/RoadmapFlow";
import { useRouter, useSearchParams } from "next/navigation";
import { readUsernameCookie } from "../../libs/auth";
import { fetchRoadmapById } from "../../data/roadmaps";

export default function RoadmapPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-[var(--color-slate)]/70">Loading roadmap…</div>}>
      <RoadmapPageContent />
    </React.Suspense>
  );
}

function RoadmapPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = React.useState<string | null>(null);
  const [remoteRoadmap, setRemoteRoadmap] = React.useState<Roadmap | null>(null);
  const [remoteLoading, setRemoteLoading] = React.useState(false);
  const [remoteError, setRemoteError] = React.useState<string | null>(null);

  const sampleRoadmap = React.useMemo(() => {
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
  const isSampleRoadmap = !selectedRoadmapId || selectedRoadmapId === sampleRoadmap?.id;

  React.useEffect(() => {
    if (isSampleRoadmap || !selectedRoadmapId) {
      setRemoteRoadmap(null);
      setRemoteError(null);
      setRemoteLoading(false);
      return;
    }

    let cancelled = false;
    setRemoteLoading(true);
    setRemoteError(null);

    fetchRoadmapById(selectedRoadmapId)
      .then(data => {
        if (!cancelled) {
          setRemoteRoadmap(data);
        }
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) {
          setRemoteError(error instanceof Error ? error.message : "Unable to load roadmap");
          setRemoteRoadmap(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRemoteLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isSampleRoadmap, selectedRoadmapId]);

  if (!sampleRoadmap) {
    return <div className="p-4 text-red-600 font-mono text-sm">Invalid sample JSON (see console).</div>;
  }

  if (!isSampleRoadmap) {
    if (remoteLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-mist)] text-[var(--color-slate)]/70 text-sm">
          Fetching roadmap…
        </div>
      );
    }

    if (remoteError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--color-mist)] text-[var(--color-slate)]">
          <div className="max-w-md text-center space-y-3">
            <h1 className="text-2xl font-semibold">We hit a snag</h1>
            <p className="text-sm text-[var(--color-slate)]/70">{remoteError}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/home")}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[var(--color-slate)] border border-[var(--color-sky)]/60 hover:bg-[var(--color-sky)]/30 transition"
            >
              Back to home
            </button>
            <button
              onClick={() => router.replace(`/roadmap?roadmapId=${encodeURIComponent(selectedRoadmapId!)}`)}
              className="rounded-xl bg-[var(--color-ocean)] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[var(--color-slate)] transition"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!remoteRoadmap) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-mist)] text-[var(--color-slate)]/60 text-sm">
          Roadmap not available right now.
        </div>
      );
    }

    if (remoteRoadmap.nodes.length === 0) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--color-mist)] text-[var(--color-slate)]">
          <div className="max-w-md text-center space-y-3">
            <h1 className="text-2xl font-semibold">Roadmap coming soon</h1>
            <p className="text-sm text-[var(--color-slate)]/70">
              We don't have full node content for <strong>{remoteRoadmap.title}</strong> yet. Check back soon or explore another roadmap.
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="font-semibold text-sm">Roadmap: {remoteRoadmap.title}</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {username && <span className="text-[var(--color-slate)]/70">Hi, {username}</span>}
            <span>{remoteRoadmap.title}</span>
          </div>
        </header>
        <div className="flex-1">
          <RoadmapFlow roadmap={remoteRoadmap} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="px-4 py-2 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="font-semibold text-sm">Roadmap: {sampleRoadmap.title}</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {username && <span className="text-[var(--color-slate)]/70">Hi, {username}</span>}
          <span>{sampleRoadmap.title}</span>
        </div>
      </header>
      <div className="flex-1">
        <RoadmapFlow roadmap={sampleRoadmap} />
      </div>
    </div>
  );
}
