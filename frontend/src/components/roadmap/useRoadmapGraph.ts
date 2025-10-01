import { useMemo } from "react";
import dagre from "@dagrejs/dagre";
import type { Roadmap } from "../../types/roadmap";
import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { getModuleColor } from "./colors";

export interface GraphOptions {
  orientation?: "LR" | "TB";
  includeModuleGrouping?: boolean;
  focusModuleId?: string | null;
  showPrereqs?: boolean;
}

const MODULE_NODE_WIDTH = 260;
const MODULE_NODE_HEIGHT = 80;
const TASK_NODE_WIDTH = 240;
const TASK_NODE_HEIGHT = 110;
const H_GAP = 120;
const V_GAP = 40;

export function useRoadmapGraph(
  roadmap: Roadmap | null | undefined,
  progress: Record<string, "not_started"|"in_progress"|"completed">,
  options: GraphOptions
) {
  return useMemo(() => {
    if (!roadmap) return { nodes: [] as Node[], edges: [] as Edge[] };

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: options.orientation ?? "LR", nodesep: V_GAP, ranksep: H_GAP });
    g.setDefaultEdgeLabel(() => ({}));

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const focusSet = new Set<string>();

    if (options.focusModuleId) {
      const mod = roadmap.modules.find(m => m.id === options.focusModuleId);
      if (mod) {
        mod.nodeIds.forEach(id => focusSet.add(id));
      }
    }

    // Optional: module grouping as "group" parent nodes (React Flow supports parentId / extent)
    const moduleColorMap = new Map<string, string>();

    if (options.includeModuleGrouping) {
      roadmap.modules.forEach((m, index) => {
        const moduleColor = getModuleColor(index);
        moduleColorMap.set(m.id, moduleColor);
        const modNode: Node = {
          id: `module:${m.id}`,
          type: "moduleNode",
          position: { x: 0, y: 0 },
          data: {
            title: m.title,
            summary: m.summary,
            order: m.order,
            moduleColor
          },
          style: {
            width: MODULE_NODE_WIDTH,
            height: MODULE_NODE_HEIGHT,
            background: moduleColor
          },
          draggable: false,
          selectable: true
        };
        g.setNode(modNode.id, { width: MODULE_NODE_WIDTH, height: MODULE_NODE_HEIGHT });
        nodes.push(modNode);
      });
    }

    if (!options.includeModuleGrouping) {
      roadmap.modules.forEach((m, index) => {
        moduleColorMap.set(m.id, getModuleColor(index));
      });
    }

    // Task nodes
    roadmap.nodes.forEach(task => {
      if (options.focusModuleId && !focusSet.has(task.id)) return;

      const status = progress[task.id] || "not_started";
      const moduleColor = moduleColorMap.get(task.moduleId) ?? getModuleColor(0);

      const node: Node = {
        id: task.id,
        type: "taskNode",
        position: { x: 0, y: 0 },
        data: {
          title: task.title,
          objective: task.objective,
          difficulty: task.difficulty,
          estimatedMinutes: task.estimatedMinutes,
          status,
          moduleColor
        },
        parentId: options.includeModuleGrouping ? `module:${task.moduleId}` : undefined,
        extent: options.includeModuleGrouping ? "parent" : undefined,
        style: {
          width: TASK_NODE_WIDTH,
          height: TASK_NODE_HEIGHT,
          background: moduleColor
        }
      };
      g.setNode(node.id, { width: TASK_NODE_WIDTH, height: TASK_NODE_HEIGHT });
      nodes.push(node);
    });

    // Edges from prerequisites
    if (options.showPrereqs !== false) {
      roadmap.nodes.forEach(task => {
        if (options.focusModuleId && !focusSet.has(task.id)) return;
        (task.prereqNodeIds || []).forEach(pr => {
          if (options.focusModuleId && !focusSet.has(pr)) return;
          edges.push({
            id: `${pr}->${task.id}`,
            source: pr,
            target: task.id,
            type: "smoothstep",
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 }
          });
          g.setEdge(pr, task.id);
        });
      });
    }

    dagre.layout(g);
    const positioned = nodes.map(n => {
      const coord = g.node(n.id);
      if (coord) {
        n.position = { x: coord.x - coord.width / 2, y: coord.y - coord.height / 2 };
      }
      return n;
    });

    return { nodes: positioned, edges };
  }, [roadmap, progress, options]);
}