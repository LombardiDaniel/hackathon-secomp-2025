import React from "react";
import sampleRoadmapRaw from "../data/example.json";
import { RoadmapSchema, type Roadmap } from "../types/roadmap";
import { RoadmapFlow } from "../components/roadmap/RoadmapFlow";
import { Sidebar } from "../components/roadmap/Sidebar";

export const App: React.FC = () => {
  const parsed = React.useMemo(() => {
    const res = RoadmapSchema.safeParse(sampleRoadmapRaw);
    if (!res.success) {
      console.error(res.error.flatten());
      return null;
    }
    return res.data as Roadmap;
  }, []);

  if (!parsed) {
    return <div className="p-4 text-red-600 font-mono">Invalid roadmap JSON check console.</div>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans">
      <Sidebar roadmap={parsed} />
      <main className="flex-1 relative">
        <RoadmapFlow roadmap={parsed} />
      </main>
    </div>
  );
};