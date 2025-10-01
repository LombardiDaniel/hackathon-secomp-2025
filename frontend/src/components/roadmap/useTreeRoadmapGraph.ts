import { useMemo } from "react";
import type { Roadmap } from "../../types/roadmap";
import type { Node, Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import { getModuleColor } from "./colors";

interface TreeOptions {
  includeRoot?: boolean;
  includeModuleGrouping?: boolean;
  collapsedModules?: Set<string>;
  horizontalGap?: number;
  verticalGap?: number;
  moduleWidth?: number;
  taskWidth?: number;
  moduleHeaderHeight?: number;
  taskHeight?: number;
  connectSequentialTasks?: boolean;   // connect tasks inside a module sequentially
  connectModulesLinearly?: boolean;    // connect last task of module N -> first task of module N+1
}

const defaultOpts: Required<TreeOptions> = {
  includeRoot: true,
  includeModuleGrouping: true,
  collapsedModules: new Set(),
  horizontalGap: 320,
  verticalGap: 36,
  moduleWidth: 260,
  taskWidth: 240,
  moduleHeaderHeight: 80,
  taskHeight: 110,
  connectSequentialTasks: true,
  connectModulesLinearly: true
} as const;

export function useTreeRoadmapGraph(
  roadmap: Roadmap | null | undefined,
  progress: Record<string, "not_started" | "in_progress" | "completed">,
  customOptions: Partial<TreeOptions> = {}
) {
  return useMemo(() => {
    if (!roadmap) return { nodes: [] as Node[], edges: [] as Edge[] };

    const options = { ...defaultOpts, ...customOptions };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Optionally a root node
    if (options.includeRoot) {
      nodes.push({
        id: "root",
        type: "moduleNode",
        position: { x: 0, y: 0 },
        data: { title: roadmap.title, summary: "Root", order: -1 },
        style: {
          width: options.moduleWidth,
          height: options.moduleHeaderHeight,
          background: "#fff",
          border: "1px solid #d1d5db"
        },
        draggable: false,
        selectable: false
      });
    }

    const sortedModules = [...roadmap.modules].sort((a, b) => a.order - b.order);

    sortedModules.forEach((mod, modIdx) => {
      const columnX = (options.includeRoot ? 1 : 0) * options.horizontalGap + modIdx * options.horizontalGap;
      const moduleColor = getModuleColor(modIdx);

      const moduleNodeId = `module:${mod.id}`;
      if (options.includeModuleGrouping) {
        nodes.push({
          id: moduleNodeId,
            type: "moduleNode",
          position: {
            x: columnX,
            y: 0
          },
          data: {
            title: mod.title,
            summary: mod.summary,
            order: mod.order,
            moduleColor
          },
          style: {
            width: options.moduleWidth,
            height: options.moduleHeaderHeight,
            background: moduleColor
          },
          draggable: false,
          parentId: options.includeRoot ? "root" : undefined,
          extent: options.includeRoot ? "parent" : undefined,
          zIndex: 1
        });
      }

      if (options.collapsedModules.has(mod.id)) {
        return; // skip tasks if collapsed
      }

      let lastTaskIdInModule: string | null = null;
      mod.nodeIds.forEach((taskId, taskIdx) => {
        const task = roadmap.nodes.find(n => n.id === taskId);
        if (!task) return;

        const status = progress[task.id] || "not_started";
        const posY = options.moduleHeaderHeight + taskIdx * (options.taskHeight + options.verticalGap);

        nodes.push({
          id: task.id,
          type: "taskNode",
          position: {
            x: columnX + 10, // slight indent
            y: posY
          },
          data: {
            title: task.title,
            objective: task.objective,
            difficulty: task.difficulty,
            estimatedMinutes: task.estimatedMinutes,
            status,
            moduleColor
          },
          parentId: options.includeModuleGrouping ? moduleNodeId : (options.includeRoot ? "root" : undefined),
          extent: options.includeModuleGrouping || options.includeRoot ? "parent" : undefined,
          style: {
            width: options.taskWidth,
            height: options.taskHeight,
            background: moduleColor
          }
        });

        // Sequential edges inside a module
        if (options.connectSequentialTasks && lastTaskIdInModule) {
          edges.push({
            id: `${lastTaskIdInModule}--${task.id}`,
            source: lastTaskIdInModule,
            target: task.id,
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
            type: "smoothstep",
            animated: false
          });
        }
        lastTaskIdInModule = task.id;

        // Prereq edges (if they cross modules)
        (task.prereqNodeIds || []).forEach(pr => {
          edges.push({
            id: `${pr}->${task.id}`,
            source: pr,
            target: task.id,
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
            type: "smoothstep",
            animated: false,
            style: { stroke: "#64748b" }
          });
        });
      });
    });

    if (options.includeRoot) {
      // Connect root to each module head (first task) or to module node
      sortedModules.forEach(mod => {
        const headTaskId = mod.nodeIds[0];
        if (headTaskId) {
          edges.push({
            id: `root->${headTaskId}`,
            source: "root",
            target: headTaskId,
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
            type: "smoothstep",
            animated: false,
            style: { stroke: "#334155" }
          });
        }
      });
    }

    // Optional cross-module linear linking (last task of module -> first task of next)
    if (options.connectModulesLinearly) {
      for (let i = 0; i < sortedModules.length - 1; i++) {
        const current = sortedModules[i];
        const next = sortedModules[i + 1];
        const lastTask = [...current.nodeIds].slice(-1)[0];
        const nextFirst = next.nodeIds[0];
        if (lastTask && nextFirst) {
          edges.push({
            id: `${lastTask}=>${nextFirst}`,
            source: lastTask,
            target: nextFirst,
            markerEnd: { type: MarkerType.ArrowClosed },
            type: "smoothstep",
            style: { stroke: "#0f766e" }
          });
        }
      }
    }

    return { nodes, edges };
  }, [roadmap, progress, customOptions]);
}