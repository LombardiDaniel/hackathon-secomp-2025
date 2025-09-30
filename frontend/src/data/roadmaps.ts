export interface RoadmapSummary {
  id: string;
  title: string;
  description: string;
  tags: string[];
  upvotes: number;
  estimatedWeeks: number;
  lastUpdated: string;
}

export const popularRoadmapsThisWeek: RoadmapSummary[] = [
  {
    id: "full-stack-ts-12w",
    title: "Full-Stack TypeScript (12 Week Path)",
    description: "Master frontend and backend TypeScript with a production-ready stack and deployment.",
    tags: ["typescript", "fullstack", "react", "node"],
    upvotes: 482,
    estimatedWeeks: 12,
    lastUpdated: "2025-09-26"
  },
  {
    id: "ai-engineer-bootcamp",
    title: "AI Engineer Bootcamp",
    description: "Applied machine learning engineering with MLOps, serving, and monitoring.",
    tags: ["ml", "python", "mlops"],
    upvotes: 439,
    estimatedWeeks: 10,
    lastUpdated: "2025-09-24"
  },
  {
    id: "mobile-react-native",
    title: "React Native Mobile Launch",
    description: "Ship your first cross-platform mobile app with Expo, navigation, and backend sync.",
    tags: ["mobile", "react-native", "expo"],
    upvotes: 318,
    estimatedWeeks: 8,
    lastUpdated: "2025-09-20"
  },
  {
    id: "data-engineering-lakehouse",
    title: "Modern Data Engineering Lakehouse",
    description: "Design batch and streaming pipelines on a lakehouse stack with dbt and Delta.",
    tags: ["data", "spark", "dbt"],
    upvotes: 287,
    estimatedWeeks: 14,
    lastUpdated: "2025-09-23"
  }
];

export const favoriteRoadmaps: RoadmapSummary[] = [
  popularRoadmapsThisWeek[0],
  {
    id: "system-design-scale",
    title: "System Design for Scale",
    description: "Architect scalable systems for interviews and production workloads.",
    tags: ["architecture", "distributed"],
    upvotes: 256,
    estimatedWeeks: 6,
    lastUpdated: "2025-09-18"
  }
];

export const recentRoadmaps: RoadmapSummary[] = [
  {
    id: "kubernetes-zero-to-prod",
    title: "Kubernetes Zero to Production",
    description: "Deploy microservices with Helm, GitOps, and observability.",
    tags: ["kubernetes", "devops"],
    upvotes: 201,
    estimatedWeeks: 9,
    lastUpdated: "2025-09-27"
  },
  popularRoadmapsThisWeek[2]
];
