import React from "react";
import type { Roadmap } from "../../types/roadmap";

export const Sidebar: React.FC<{ roadmap: Roadmap }> = ({ roadmap }) => {
  return (
    <aside className="w-64 border-r p-4 overflow-y-auto text-sm bg-white">
      <h2 className="font-semibold mb-2 text-gray-800">Modules</h2>
      <ol className="space-y-2">
        {roadmap.modules
          .sort((a,b) => a.order - b.order)
          .map(m => (
            <li key={m.id} className="border rounded p-2">
              <div className="font-medium">{m.title}</div>
              <div className="text-[11px] text-gray-600">
                {m.nodeIds.length} steps
              </div>
            </li>
          ))
        }
      </ol>
    </aside>
  );
};