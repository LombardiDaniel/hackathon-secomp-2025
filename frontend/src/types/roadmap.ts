import { z } from "zod";

export const ResourceSchema = z.object({
  type: z.string(),
  title: z.string(),
  url: z.string().url(),
  cost: z.string().optional()
});

export const NodeSchema = z.object({
  id: z.string().regex(/^[\w-]+$/),
  moduleId: z.string(),
  title: z.string().min(2).max(160),
  objective: z.string().max(500).optional(),
  contentMarkdown: z.string().optional(),
  resources: z.array(ResourceSchema).optional(),
  difficulty: z.enum(["beginner","intermediate","advanced"]),
  estimatedMinutes: z.number().int().positive(),
  prereqNodeIds: z.array(z.string()).optional().default([])
});

export type RoadmapNode = z.infer<typeof NodeSchema>;

export const ModuleSchema = z.object({
  id: z.string().regex(/^[\w-]+$/),
  title: z.string().min(3).max(160),
  summary: z.string().optional(),
  order: z.number().int().nonnegative(),
  nodeIds: z.array(z.string()).nonempty()
});

export type RoadmapModule = z.infer<typeof ModuleSchema>;

const NodesArraySchema = z.array(NodeSchema);

export const RoadmapSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[\w-]+$/),
  upvotes: z.number().int().nonnegative().default(0),
  userEmail: z.string().email().optional(),
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(5000),
  difficulty: z.enum(["beginner","intermediate","advanced","mixed"]),
  estimatedTotalMinutes: z.number().int().positive(),
  tags: z.array(z.string()).max(30).optional(),
  modules: z.array(ModuleSchema).nonempty(),
  nodes: z.preprocess((value) => {
    if (value === null || value === undefined) {
      return [];
    }
    return value;
  }, NodesArraySchema)
})
.superRefine((val, ctx) => {
  if (val.nodes.length === 0) {
    return;
  }

  const nodeIdSet = new Set(val.nodes.map(n => n.id));
  // Validate module nodeIds exist
  for (const m of val.modules) {
    for (const nid of m.nodeIds) {
      if (!nodeIdSet.has(nid)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
            message: `module ${m.id} references missing node ${nid}`
        });
      }
    }
  }
  // Validate moduleId matches
  const moduleIds = new Set(val.modules.map(m => m.id));
  for (const n of val.nodes) {
    if (!moduleIds.has(n.moduleId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `node ${n.id} has invalid moduleId ${n.moduleId}`
      });
    }
  }
  // Detect circular prereqs (simple DFS)
  const graph: Record<string,string[]> = {};
  val.nodes.forEach(n => { graph[n.id] = n.prereqNodeIds ?? []; });
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function dfs(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const p of graph[id] || []) {
      if (!graph[p]) continue;
      if (dfs(p)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  for (const id of Object.keys(graph)) {
    if (dfs(id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `circular prerequisite detected at ${id}`
      });
      break;
    }
  }
});

export type Roadmap = z.infer<typeof RoadmapSchema>;