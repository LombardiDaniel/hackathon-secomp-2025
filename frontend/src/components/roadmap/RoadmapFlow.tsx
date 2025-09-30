import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  NodeTypes
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Roadmap } from "../../types/roadmap";
import { ModuleNode } from "./ModuleNode";
import { TaskNode } from "./TaskNode";
import { Sidebar } from "./Sidebar";
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
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("dependency");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [orientation, setOrientation] = useState<"LR"|"TB">("TB");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);

  const toggleModule = (modId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId); else next.add(modId);
      return next;
    });
  };

  const handleProgressChange = (nodeId: string, status: "not_started" | "in_progress" | "completed") => {
    setProgress(prev => ({ ...prev, [nodeId]: status }));
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
    // Set the selected node for sidebar and show it
    setSelectedNode(node);
    setSidebarVisible(true);
    
    if (node.type === "taskNode") {
      // Remove the automatic status cycling on click since we now have controls in sidebar
    } else if (node.id.startsWith("module:") && layoutMode === "tree") {
      const raw = node.id.slice("module:".length);
      toggleModule(raw);
    }
  }, [layoutMode]);

  const handleSidebarClose = () => {
    setSidebarVisible(false);
    setSelectedNode(null);
  };

  return (
    <div className="h-full w-full relative flex">
      <div className={`flex-1 transition-all duration-300 ${sidebarVisible ? 'mr-80' : ''}`}>
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          fitView
          onNodeClick={handleNodeClick}
          panOnScroll={false}
          zoomOnScroll={true}
          proOptions={{ hideAttribution: true }}
        >
          {/* <Background /> */}
          <MiniMap pannable zoomable />
          <Controls />
        </ReactFlow>
      </div>
      
      {sidebarVisible && (
        <div className="fixed right-0 top-0 h-full z-10">
          <Sidebar 
            roadmap={roadmap} 
            selectedNode={selectedNode} 
            onClose={handleSidebarClose}
            isVisible={sidebarVisible}
            progress={progress}
            onProgressChange={handleProgressChange}
          />
        </div>
      )}
    </div>
  );
};