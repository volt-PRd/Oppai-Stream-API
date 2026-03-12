# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Scraping**: axios + cheerio (for oppai.stream)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (OppAI scraper routes)
│   └── oppai-docs/         # React + Vite API documentation & tester
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Endpoints (OppAI Stream Scraper)

All endpoints are under `/api` and require no authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/anime/:slug` | Full anime info (title, synopsis, genres, episodes, etc.) |
| GET | `/api/anime/:slug/episodes` | List of all episodes |
| GET | `/api/anime/:slug/episode/:num` | Raw stream URLs for all qualities + subtitles |
| GET | `/api/search?q=...` | Search anime by title |
| GET | `/api/latest?page=...` | Latest released episodes |

## Artifacts

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server with OppAI scraper routes.
- `src/lib/scraper.ts` — Web scraper using axios + cheerio
- `src/routes/anime.ts` — Anime info and episode stream routes
- `src/routes/search.ts` — Search route
- `src/routes/latest.ts` — Latest episodes route

### `artifacts/oppai-docs` (`@workspace/oppai-docs`)
React + Vite documentation site for the API.
- Documentation page with all endpoints, code examples in Python and Java
- Interactive API Tester page
- `src/data/docs.ts` — All endpoint documentation data

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. Run `pnpm run typecheck` from root.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Packages

### `lib/api-spec` (`@workspace/api-spec`)
Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/db` (`@workspace/db`)
Push schema: `pnpm --filter @workspace/db run push`
