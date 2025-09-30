import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  Panel,
  NodeTypes
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRoadmapGraph } from "./useRoadmapGraph";
import type { Roadmap } from "../../types/roadmap";
import { ModuleNode } from "./ModuleNode";
import { TaskNode } from "./TaskNode";

interface RoadmapFlowProps {
  roadmap: Roadmap;
}

const nodeTypes: NodeTypes = {
  moduleNode: ModuleNode,
  taskNode: TaskNode
};

export const RoadmapFlow: React.FC<RoadmapFlowProps> = ({ roadmap }) => {
  const [progress, setProgress] = useState<Record<string,"not_started"|"in_progress"|"completed">>({});

  const [options, setOptions] = useState({
    orientation: "LR" as "LR" | "TB",
    includeModuleGrouping: true,
    focusModuleId: null as string | null
  });

  const { nodes: layoutNodes, edges: layoutEdges } = useRoadmapGraph(
    roadmap,
    progress,
    {
      orientation: options.orientation,
      includeModuleGrouping: options.includeModuleGrouping,
      focusModuleId: options.focusModuleId,
      showPrereqs: true
    }
  );

  const [nodes, , onNodesChange] = useNodesState(layoutNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutEdges);

  // Sync computed layout to internal state when layout changes
  React.useEffect(() => {
    // Replace all nodes/edges whenever layoutNodes changes (MVP simple approach)
    // For smoother transitions you could diff & animate.
    (window as any).requestIdleCallback?.(() => {
      onNodesChange([{ type: "reset", nodes: layoutNodes } as any]);
      onEdgesChange([{ type: "reset", edges: layoutEdges } as any]);
    }) || ( () => {
      onNodesChange([{ type: "reset", nodes: layoutNodes } as any]);
      onEdgesChange([{ type: "reset", edges: layoutEdges } as any]);
    })();
  }, [layoutNodes, layoutEdges, onNodesChange, onEdgesChange]);

  const handleNodeClick = useCallback((_, node) => {
    if (node.type === "taskNode") {
      setProgress(prev => {
        const curr = prev[node.id] || "not_started";
        const next = curr === "not_started" ? "in_progress" :
                     curr === "in_progress" ? "completed" : "not_started";
        return { ...prev, [node.id]: next };
      });
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={layoutNodes}
        edges={layoutEdges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={handleNodeClick}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <MiniMap pannable zoomable />
        <Controls />
        <Panel position="top-left" className="space-y-2 bg-white/80 backdrop-blur-sm p-3 rounded shadow">
          <h3 className="font-semibold text-sm">{roadmap.title}</h3>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Orientation</label>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={options.orientation}
              onChange={e => setOptions(o => ({ ...o, orientation: e.target.value as any }))}
            >
              <option value="LR">Left → Right</option>
              <option value="TB">Top → Bottom</option>
            </select>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={options.includeModuleGrouping}
                onChange={e => setOptions(o => ({ ...o, includeModuleGrouping: e.target.checked }))}
              />
              Module Grouping
            </label>
            <label className="text-xs font-medium">Focus Module</label>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={options.focusModuleId ?? ""}
              onChange={e => setOptions(o => ({ ...o, focusModuleId: e.target.value || null }))}
            >
              <option value="">All</option>
              {roadmap.modules
                .sort((a,b) => a.order - b.order)
                .map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div className="text-[10px] text-gray-500">
            Click a task node to cycle progress.
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};