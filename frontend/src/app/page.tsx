"use client";

import React from "react";
import sampleRoadmapRaw from "../data/example.json";
import { RoadmapSchema, type Roadmap } from "../types/roadmap";
import { RoadmapFlow } from "../components/roadmap/RoadmapFlow";
import { Sidebar } from "../components/roadmap/Sidebar";

export default function Home() {
  const roadmap = React.useMemo(() => {
    const parsed = RoadmapSchema.safeParse(sampleRoadmapRaw);
    if (!parsed.success) {
      console.error(parsed.error.flatten());
      return null;
    }
    return parsed.data as Roadmap;
  }, []);

  if (!roadmap) {
    return <div className="p-4 text-red-600 font-mono text-sm">Invalid sample JSON (see console).</div>;
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="px-4 py-2 bg-white border-b flex items-center justify-between">
        <h1 className="font-semibold text-sm">Roadmap Graph MVP</h1>
        <span className="text-xs text-gray-500">{roadmap.id}</span>
      </header>
      <div className="flex-1">
        <RoadmapFlow roadmap={roadmap} />
      </div>
    </div>
  );
}