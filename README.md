# hackathon-secomp-2025

Current JSON schema

```
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/roadmap.schema.json",
  "title": "Roadmap",
  "type": "object",
  "required": ["schemaVersion", "id", "title", "modules"],
  "properties": {
    "schemaVersion": { "type": "integer", "const": 1 },
    "id": { "type": "string", "pattern": "^[a-zA-Z0-9_-]+$" },
    "title": { "type": "string", "minLength": 3, "maxLength": 160 },
    "description": { "type": "string", "minLength": 10, "maxLength": 5000 },
    "difficulty": { "type": "string", "enum": ["beginner","intermediate","advanced","mixed"] },
    "estimatedTotalMinutes": { "type": "integer", "minimum": 1 },
    "tags": {
      "type": "array",
      "items": { "type": "string", "minLength": 2, "maxLength": 40 },
      "maxItems": 30,
      "uniqueItems": true
    },
    "modules": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id","title","order","nodeIds"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-zA-Z0-9_-]+$" },
          "title": { "type": "string", "minLength": 3, "maxLength": 160 },
            "summary": { "type": "string" },
          "order": { "type": "integer", "minimum": 0 },
          "nodeIds": {
            "type": "array",
            "items": { "type": "string", "pattern": "^[a-zA-Z0-9_-]+$" },
            "uniqueItems": true
          }
        }
      }
    },
    "nodes": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id","title","moduleId","estimatedMinutes","difficulty"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-zA-Z0-9_-]+$" },
          "moduleId": { "type": "string" },
          "title": { "type": "string", "minLength": 2, "maxLength": 160 },
          "objective": { "type": "string", "maxLength": 500 },
          "contentMarkdown": { "type": "string" },
          "resources": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["type","title","url"],
              "properties": {
                "type": { "type": "string" },
                "title": { "type": "string" },
                "url": { "type": "string", "format": "uri" },
                "cost": { "type": "string" }
              }
            }
          },
          "difficulty": { "type": "string", "enum": ["beginner","intermediate","advanced"] },
          "estimatedMinutes": { "type": "integer", "minimum": 1 },
          "prereqNodeIds": {
            "type": "array",
            "items": { "type": "string" },
            "uniqueItems": true
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

# Exemplo:
```
{
  "schemaVersion": 1,
  "id": "full-stack-ts-12w",
  "title": "Full-Stack TypeScript (12 Week Path)",
  "description": "Structured path to build full-stack TypeScript competency including tooling, frontend, backend, and deployment.",
  "difficulty": "intermediate",
  "estimatedTotalMinutes": 10800,
  "tags": ["typescript","web","backend","frontend"],
  "modules": [
    { "id": "mod-foundations", "title": "Foundations", "order": 0, "summary": "Environment + Core TS basics", "nodeIds": ["n-env","n-ts-basics","n-tooling"] },
    { "id": "mod-frontend", "title": "Frontend Core", "order": 1, "summary": "React & SPA patterns", "nodeIds": ["n-react","n-state","n-routing"] },
    { "id": "mod-backend", "title": "Backend Core", "order": 2, "summary": "API design & persistence", "nodeIds": ["n-api","n-db","n-auth"] },
    { "id": "mod-deploy", "title": "Deployment & Scaling", "order": 3, "summary": "CI/CD + infra basics", "nodeIds": ["n-ci","n-deploy"] }
  ],
  "nodes": [
    {
      "id": "n-env",
      "moduleId": "mod-foundations",
      "title": "Set Up Environment",
      "objective": "Install Node.js, package manager, editor tooling.",
      "estimatedMinutes": 120,
      "difficulty": "advanced",
      "prereqNodeIds": []
    },
    {
      "id": "n-ts-basics",
      "moduleId": "mod-foundations",
      "title": "TypeScript Basics",
      "objective": "Learn types, interfaces, generics, narrowing.",
      "estimatedMinutes": 240,
      "difficulty": "beginner",
      "prereqNodeIds": ["n-env"]
    },
    {
      "id": "n-tooling",
      "moduleId": "mod-foundations",
      "title": "Tooling & Quality",
      "objective": "ESLint, Prettier, tsconfig optimization.",
      "estimatedMinutes": 120,
      "difficulty": "beginner",
      "prereqNodeIds": ["n-ts-basics"]
    },
    {
      "id": "n-react",
      "moduleId": "mod-frontend",
      "title": "React Fundamentals",
      "objective": "JSX, function components, hooks.",
      "estimatedMinutes": 300,
      "difficulty": "beginner",
      "prereqNodeIds": ["n-tooling"]
    },
    {
      "id": "n-state",
      "moduleId": "mod-frontend",
      "title": "State Management",
      "objective": "Context vs external libs, query caching.",
      "estimatedMinutes": 240,
      "difficulty": "intermediate",
      "prereqNodeIds": ["n-react"]
    },
    {
      "id": "n-routing",
      "moduleId": "mod-frontend",
      "title": "Routing & Navigation",
      "objective": "Nested routes, code splitting.",
      "estimatedMinutes": 180,
      "difficulty": "intermediate",
      "prereqNodeIds": ["n-react"]
    },
    {
      "id": "n-api",
      "moduleId": "mod-backend",
      "title": "API Design",
      "objective": "REST patterns, validation.",
      "estimatedMinutes": 300,
      "difficulty": "intermediate",
      "prereqNodeIds": ["n-state","n-routing"]
    },
    {
      "id": "n-db",
      "moduleId": "mod-backend",
      "title": "Database Layer",
      "objective": "SQL vs NoSQL, ORMs, migrations.",
      "estimatedMinutes": 300,
      "difficulty": "intermediate",
      "prereqNodeIds": ["n-api"]
    },
    {
      "id": "n-auth",
      "moduleId": "mod-backend",
      "title": "Authentication & Authorization",
      "objective": "Sessions, JWT, RBAC.",
      "estimatedMinutes": 240,
      "difficulty": "advanced",
      "prereqNodeIds": ["n-api"]
    },
    {
      "id": "n-ci",
      "moduleId": "mod-deploy",
      "title": "CI Pipeline",
      "objective": "Automated tests, lint, build.",
      "estimatedMinutes": 180,
      "difficulty": "intermediate",
      "prereqNodeIds": ["n-db","n-auth"]
    },
    {
      "id": "n-deploy",
      "moduleId": "mod-deploy",
      "title": "Deployment & Observability",
      "objective": "Containers, logs, metrics, error tracking.",
      "estimatedMinutes": 240,
      "difficulty": "advanced",
      "prereqNodeIds": ["n-ci"]
    }
  ]
}
```
