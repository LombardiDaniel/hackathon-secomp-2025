import { useMemo } from "react";
import dagre from "@dagrejs/dagre";
import type { Roadmap } from "../../types/roadmap";
import { MarkerType, type Edge, type Node } from "@xyflow/react";

interface DepOptions {
  orientation?: "LR" | "TB";
  showModules?: boolean;
}

export function useDependencyGraph(
  roadmap: Roadmap | null | undefined,
  progress: Record<string, "not_started" | "in_progress" | "completed">,
  opts: DepOptions
) {
  return useMemo(() => {
    if (!roadmap) return { nodes: [] as Node[], edges: [] as Edge[] };
    const orientation = opts.orientation ?? "LR";
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: orientation, nodesep: 60, ranksep: 120 });
    g.setDefaultEdgeLabel(() => ({}));

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const moduleColors = ["#fef3c7","#e0f2fe","#ede9fe","#dcfce7","#fee2e2","#f1f5f9"];

    roadmap.nodes.forEach(task => {
      const status = progress[task.id] || "not_started";
      const moduleIndex = roadmap.modules.find(m => m.id === task.moduleId)?.order ?? 0;
      const modColor = moduleColors[moduleIndex % moduleColors.length];

      const n: Node = {
        id: task.id,
        type: "taskNode",
        position: { x: 0, y: 0 },
        data: {
          title: task.title,
          objective: task.objective,
          difficulty: task.difficulty,
          estimatedMinutes: task.estimatedMinutes,
          status
        },
        style: {
          width: 240,
          height: 110,
          background: modColor
        }
      };
      nodes.push(n);
      g.setNode(task.id, { width: 240, height: 110 });
    });

    roadmap.nodes.forEach(task => {
      (task.prereqNodeIds || []).forEach(pr => {
        edges.push({
          id: `${pr}->${task.id}`,
          source: pr,
          target: task.id,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
          style: { stroke: "#475569" }
        });
        g.setEdge(pr, task.id);
      });
    });

    dagre.layout(g);
    nodes.forEach(n => {
      const coord = g.node(n.id);
      if (coord) {
        n.position = {
          x: coord.x - coord.width / 2,
          y: coord.y - coord.height / 2
        };
      }
    });

    return { nodes, edges };
  }, [roadmap, progress, opts.orientation, opts.showModules]);
}