import { z } from "zod";
import { RoadmapSchema } from "../types/roadmap";

const API_BASE = (process.env.NEXT_PUBLIC_ROADY_API_BASE ?? "https://api.roady.patos.dev").replace(/\/$/, "");
const ROADMAPS_URL = `${API_BASE}/v1/roadmaps` as const;
const MINUTES_PER_WEEK = 60 * 15;
const CACHE_TTL_MS = 60 * 1000;

const RoadmapListSchema = z.array(RoadmapSchema);
type RoadmapDetail = z.infer<typeof RoadmapSchema>;

export interface RoadmapSummary {
  id: string;
  title: string;
  description: string;
  tags: string[];
  upvotes: number;
  estimatedTotalMinutes: number;
  estimatedWeeks: number;
  lastUpdated: string | null;
}

interface CachedRoadmaps {
  fetchedAt: number;
  summaries: RoadmapSummary[];
}

let cache: CachedRoadmaps | null = null;
const detailCache = new Map<string, { fetchedAt: number; roadmap: RoadmapDetail }>();

const toIsoFromObjectId = (id: string): string | null => {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
  try {
    const timestampSeconds = parseInt(id.slice(0, 8), 16);
    return new Date(timestampSeconds * 1000).toISOString();
  } catch (error) {
    console.warn("Failed to derive timestamp from roadmap id", error);
    return null;
  }
};

const computeEstimatedWeeks = (minutes: number): number => {
  if (!Number.isFinite(minutes) || minutes <= 0) return 1;
  return Math.max(1, Math.round(minutes / MINUTES_PER_WEEK));
};

const mapToSummary = (roadmap: z.infer<typeof RoadmapSchema>): RoadmapSummary => {
  const estimatedMinutes = roadmap.estimatedTotalMinutes;
  return {
    id: roadmap.id,
    title: roadmap.title,
    description: roadmap.description,
    tags: roadmap.tags ?? [],
    upvotes: roadmap.upvotes ?? 0,
    estimatedTotalMinutes: estimatedMinutes,
    estimatedWeeks: computeEstimatedWeeks(estimatedMinutes),
    lastUpdated: toIsoFromObjectId(roadmap.id)
  };
};

const fetchRoadmapsFromApi = async (): Promise<RoadmapSummary[]> => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.summaries;
  }

  const response = await fetch(ROADMAPS_URL, {
    headers: { Accept: "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to load roadmaps: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  const parsed = RoadmapListSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Invalid roadmap payload", parsed.error.flatten());
    throw new Error("Received malformed roadmap data from API");
  }

  const summaries = parsed.data
    .map(mapToSummary)
    .sort((a, b) => b.upvotes - a.upvotes || a.title.localeCompare(b.title));

  cache = {
    fetchedAt: Date.now(),
    summaries
  };

  return summaries;
};

export const fetchRoadmapSummaries = async (options?: { forceRefresh?: boolean }): Promise<RoadmapSummary[]> => {
  if (options?.forceRefresh) {
    cache = null;
  }
  return fetchRoadmapsFromApi();
};

export const searchRoadmapSummaries = async (query: string): Promise<RoadmapSummary[]> => {
  const roadmaps = await fetchRoadmapSummaries();
  const term = query.trim().toLowerCase();
  if (!term) {
    return roadmaps;
  }

  return roadmaps.filter(roadmap => {
    const haystack = [roadmap.title, roadmap.description, ...roadmap.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
};

export const getRecentRoadmaps = async (): Promise<RoadmapSummary[]> => {
  const roadmaps = await fetchRoadmapSummaries();
  return [...roadmaps]
    .sort((a, b) => {
      const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
      const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5);
};

export const getFavoriteCandidates = async (): Promise<RoadmapSummary[]> => {
  const roadmaps = await fetchRoadmapSummaries();
  return roadmaps.slice(0, 3);
};

export const clearRoadmapCache = () => {
  cache = null;
};

export const fetchRoadmapById = async (id: string, options?: { forceRefresh?: boolean }): Promise<RoadmapDetail> => {
  const normalizedId = id.trim();
  if (!normalizedId) {
    throw new Error("Roadmap id is required");
  }

  if (!options?.forceRefresh) {
    const cached = detailCache.get(normalizedId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.roadmap;
    }
  } else {
    detailCache.delete(normalizedId);
  }

  const response = await fetch(`${ROADMAPS_URL}/${encodeURIComponent(normalizedId)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store"
  });

  if (response.status === 404) {
    throw new Error("Roadmap not found");
  }

  if (!response.ok) {
    throw new Error(`Failed to load roadmap ${normalizedId}: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  const parsed = RoadmapSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Invalid roadmap payload", parsed.error.flatten());
    throw new Error("Received malformed roadmap data from API");
  }

  const roadmap = parsed.data;
  detailCache.set(normalizedId, { fetchedAt: Date.now(), roadmap });
  return roadmap;
};
