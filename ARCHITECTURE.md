# ARCHITECTURE.md — System Design

Last updated: 2025-03-31
Update this file when you add, remove, or significantly change any system component.

---

## System Overview

```
User browser
    │
    ├── React app (GitHub Pages — static)
    │       │
    │       ├── D3-force (position computation)
    │       ├── Framer Motion (animations)
    │       └── Zustand (graph state)
    │
    └── SSE connection ──► Express API (Railway)
                                │
                                ├── Pass 1: Structure generation
                                ├── Pass 2: Enrichment + cross-edges
                                ├── Expand: On-demand node depth
                                └── Collapse: Seed insight
                                        │
                                        └── Anthropic API (Claude claude-sonnet-4-20250514)
```

---

## Frontend Architecture

### State Flow

```
User types idea
    │
    ▼
IdeaInput.tsx
    │  calls generate(idea)
    ▼
useGraphStream.ts (hook)
    │  opens SSE connection to /api/generate
    │  streams nodes → graphStore.addNode()
    │  streams edges → graphStore.addEdge()
    │  streams stability → graphStore.updateStability()
    ▼
graphStore.ts (Zustand)
    │  nodes[], edges[], positions{}, activeStress
    ▼
useForceLayout.ts (hook)
    │  reads nodes + edges from store
    │  runs D3 simulation
    │  writes positions → graphStore.setPositions()
    ▼
GraphCanvas.tsx
    │  reads nodes + positions + activeStress from store
    │  computes styleVariant per node via selectNodeStyle()
    ├── GraphNode.tsx (per node, animated with Framer Motion)
    ├── GraphEdge.tsx (hierarchical edges)
    └── CrossEdge.tsx (causal edges, different visual treatment)
```

### Component Hierarchy

```
App
├── IdeaInput          # Entry screen
└── GraphCanvas        # Main experience
    ├── GraphEdge[]    # Hierarchical connections
    ├── CrossEdge[]    # Causal cross-branch connections
    ├── GraphNode[]    # All nodes (root, primary, secondary)
    ├── BreakTooltip   # Hover overlay (portal)
    ├── SeedInsight    # Post-collapse one-liner
    └── Controls
        ├── StressBar      # Stress overlay toggles
        └── CollapseButton
```

---

## Backend Architecture

### API Routes

| Route | Method | Purpose | Streaming |
|-------|--------|---------|-----------|
| `/api/generate` | POST | Pass 1: graph skeleton | SSE |
| `/api/enrich` | POST | Pass 2: stability + cross-edges | SSE |
| `/api/expand` | POST | On-demand node depth | SSE |
| `/api/collapse` | POST | Seed insight after collapse | JSON |
| `/api/health` | GET | Uptime check | JSON |

### SSE Event Types

```typescript
// Events emitted by the backend over SSE
type SSEEvent =
  | { type: 'node'; payload: GraphNode }
  | { type: 'edge'; payload: GraphEdge }
  | { type: 'stability'; payload: { nodeId: string; stability: StabilityMap } }
  | { type: 'breakpoint'; payload: { nodeId: string; breakPoint: string } }
  | { type: 'crossedge'; payload: GraphEdge }
  | { type: 'done'; payload: null }
  | { type: 'error'; payload: { message: string } };
```

### LLM Call Flow

```
POST /api/generate
    │
    ├── Validate input (trim, length check, sanitize)
    ├── Build Pass 1 prompt (from PROMPTS.ts)
    ├── Call Anthropic API (streaming)
    ├── Parse streaming JSON chunks (partial JSON handler)
    ├── Validate each node via Zod
    ├── Emit 'node' SSE events as nodes are parsed
    └── Emit 'done' when complete

POST /api/enrich (called automatically after generate completes)
    │
    ├── Receive full graph from client
    ├── Build Pass 2 prompt with graph JSON
    ├── Call Anthropic API (non-streaming — need complete response)
    ├── Validate full response via Zod
    ├── Emit 'stability' events (per node)
    ├── Emit 'breakpoint' events (per node)
    ├── Emit 'crossedge' events
    └── Emit 'done'
```

---

## Key Design Decisions

### Why D3-force, not React Flow?

React Flow is optimized for flowcharts and DAGs with manual node positioning.
IdeaGraph needs a physics-based organic layout that settles based on graph topology.
D3-force simulates attractive/repulsive forces between nodes — the layout *discovers* itself.
React Flow would require us to precompute positions, which removes the "idea settling into shape" feeling.

### Why two LLM passes instead of one?

Cross-edges and stability scores require global awareness of the full graph.
A single pass would need to generate structure AND analyze it simultaneously — asking the model
to do two different cognitive tasks at once produces worse output for both.
Pass 1 = "build the thing". Pass 2 = "analyze the thing you just built". Cleaner separation.

### Why SSE instead of WebSockets?

SSE is unidirectional (server → client) and simpler to implement for this use case.
We have no need for client → server messages after the initial POST.
SSE works over HTTP/2, doesn't require a persistent connection setup, and has
built-in reconnection. WebSockets would add complexity without benefit.

### Why GitHub Pages + Railway split?

GitHub Pages is free, has CDN, and is automatic on push. Perfect for the static frontend.
Railway is the simplest platform for a Node.js API with SSE support — Vercel's serverless
functions have a timeout that would kill long SSE connections.

### Why Zustand, not Redux or Context?

Graph state updates happen on every D3 tick (~60fps during simulation). Redux adds
middleware overhead; Context causes full subtree re-renders. Zustand's direct subscription
model means only components that read a specific slice re-render.

---

## Data Flow: Stress Overlay (Zero API Calls)

The stress overlay requires no additional API calls because stability scores
were generated in Pass 2 and stored in each node's `stability` map.

```
User toggles "Trust"
    │
    ▼
StressBar.tsx dispatches setActiveStress('trust')
    │
    ▼
graphStore.activeStress = 'trust'
    │
    ▼
GraphCanvas.tsx re-renders
    │  selectNodeStyle(node, 'trust') reads node.stability.trust
    ├── score ≥ 0.7 → styleVariant = 'stable'
    ├── score ≥ 0.4 → styleVariant = 'uncertain'
    └── score < 0.4 → styleVariant = 'fragile'
    │
    ▼
GraphNode.tsx applies CSS class from styleVariant
(Framer Motion transitions opacity, color, edge animation)
```

Total latency: < 16ms (one render cycle). Instant from user perspective.

---

## Environment Configuration

```
Development:
  Frontend: http://localhost:5173 (Vite dev server)
  Backend:  http://localhost:3001 (Express)
  VITE_API_URL=http://localhost:3001

Production:
  Frontend: https://[username].github.io/ideagraph/
  Backend:  https://ideagraph-api.railway.app
  VITE_API_URL=https://ideagraph-api.railway.app
```

---

## Known Constraints

- **No persistence** — graphs exist only in session memory. Refresh = start over.
  (URL-hash sharing considered in ask.md Q-007)
- **Desktop only** — D3 force graphs require hover + precision click. No mobile.
- **Single concurrent generation** — the client doesn't support multiple simultaneous
  graph generations. Starting a new idea resets all state.
- **LLM latency** — Pass 1 + Pass 2 combined is ~7s. The streaming UX mitigates
  perceived wait time but cannot eliminate it.
