import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  Panel,
  NodeTypes
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Roadmap } from "../../types/roadmap";
import { ModuleNode } from "./ModuleNode";
import { TaskNode } from "./TaskNode";
import { useTreeRoadmapGraph } from "./useTreeRoadmapGraph";
import { useDependencyGraph } from "./useDependencyGraph";

const nodeTypes: NodeTypes = {
  moduleNode: ModuleNode,
  taskNode: TaskNode
};

type LayoutMode = "tree" | "dependency";

export const RoadmapFlow: React.FC<{ roadmap: Roadmap }> = ({ roadmap }) => {
  const [progress, setProgress] =
    useState<Record<string,"not_started"|"in_progress"|"completed">>({});
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("tree");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [orientation, setOrientation] = useState<"LR"|"TB">("LR");

  const toggleModule = (modId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId); else next.add(modId);
      return next;
    });
  };

  const treeGraph = useTreeRoadmapGraph(
    roadmap,
    progress,
    {
      collapsedModules: collapsed,
      //orientation // not used yet but you could adapt widths multi-line
    }
  );

  const depGraph = useDependencyGraph(roadmap, progress, { orientation });

  const graph = layoutMode === "tree" ? treeGraph : depGraph;

  const handleNodeClick = useCallback((_e: any, node: any) => {
    if (node.type === "taskNode") {
      setProgress(prev => {
        const curr = prev[node.id] || "not_started";
        const next = curr === "not_started" ? "in_progress" :
                     curr === "in_progress" ? "completed" : "not_started";
        return { ...prev, [node.id]: next };
      });
    } else if (node.id.startsWith("module:") && layoutMode === "tree") {
      const raw = node.id.slice("module:".length);
      toggleModule(raw);
    }
  }, [layoutMode]);

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={handleNodeClick}
        panOnScroll
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <MiniMap pannable zoomable />
        <Controls />
        <Panel position="top-left" className="bg-white/90 backdrop-blur-sm rounded shadow p-3 space-y-3 w-64">
          <h3 className="font-semibold text-sm leading-tight">{roadmap.title}</h3>
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium">Layout Mode</label>
              <select
                className="border rounded px-2 py-1 text-xs"
                value={layoutMode}
                onChange={e => setLayoutMode(e.target.value as LayoutMode)}
              >
                <option value="tree">Tree (Modules Columns)</option>
                <option value="dependency">Dependency (DAG)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium">Orientation (DAG only)</label>
              <select
                className="border rounded px-2 py-1 text-xs"
                value={orientation}
                onChange={e => setOrientation(e.target.value as any)}
                disabled={layoutMode === "tree"}
              >
                <option value="LR">Left → Right</option>
                <option value="TB">Top → Bottom</option>
              </select>
            </div>
            {layoutMode === "tree" && (
              <div className="text-[11px] text-gray-600">
                Click a module to collapse/expand. Click tasks to cycle status.
              </div>
            )}
          </div>
          <div className="text-[10px] text-gray-500">
            Tasks: {roadmap.nodes.length}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};