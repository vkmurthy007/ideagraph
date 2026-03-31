# SKILL.md — Coding Patterns for IdeaGraph

State-of-the-art practices for this specific project.
Read this before writing any new code.

---

## 1. D3 + React Integration

**The golden rule:** D3 owns math, React owns DOM.

Never let D3 directly manipulate DOM elements. Let D3 compute positions and
React render them. This prevents the two from fighting over the same nodes.

```typescript
// ✅ CORRECT — D3 computes, Zustand holds, React renders
// src/hooks/useForceLayout.ts
export function useForceLayout(nodes: GraphNode[], edges: GraphEdge[]) {
  const setPositions = useGraphStore(s => s.setPositions);

  useEffect(() => {
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(d => 
        (d as GraphEdge).type === 'causal' ? 200 : 120
      ))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(50));

    sim.on('tick', () => {
      setPositions(
        Object.fromEntries(
          (sim.nodes() as any[]).map(n => [n.id, { x: n.x, y: n.y }])
        )
      );
    });

    return () => { sim.stop(); };
  }, [nodes.length, edges.length]); // Re-init when graph topology changes
}

// ❌ WRONG — D3 touching the DOM
d3.select('#node-123').attr('cx', x).attr('cy', y);
```

---

## 2. SSE Streaming Pattern

All LLM generation streams via Server-Sent Events. Never wait for a complete response.

```typescript
// src/hooks/useGraphStream.ts
export function useGraphStream() {
  const addNode = useGraphStore(s => s.addNode);

  const generate = useCallback(async (idea: string) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === 'node') addNode(event.payload);
          if (event.type === 'edge') addEdge(event.payload);
          if (event.type === 'stability') updateStability(event.payload);
        } catch {} // Partial chunk — skip, will retry on next read
      }
    }
  }, []);

  return { generate };
}

// api/generate.ts (backend)
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

// Emit events as LLM generates them
const emit = (type: string, payload: unknown) => {
  res.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
};
```

---

## 3. LLM Prompt Management

All prompts live in `PROMPTS.md` as the source of truth.
Code reads from a prompts module that mirrors PROMPTS.md content.

```typescript
// src/lib/prompts.ts — single source of truth in code
// Any change here should be reflected in PROMPTS.md and vice versa

export const PROMPTS = {
  PASS_1_SYSTEM: `...`, // copied from PROMPTS.md
  PASS_1_USER: (idea: string) => `Expand this product idea into a graph: "${idea}"`,
  PASS_2_SYSTEM: `...`,
  PASS_2_USER: (graph: GraphData) => `...`,
  COLLAPSE_SYSTEM: `...`,
} as const;
```

**Never hardcode prompt strings in API route files.**

---

## 4. Zustand Store Pattern

One store. Flat structure. Selectors for derived state.

```typescript
// src/store/graphStore.ts
interface GraphState {
  // Raw data
  nodes: GraphNode[];
  edges: GraphEdge[];
  positions: Record<string, { x: number; y: number }>;
  
  // UI state
  activeStress: StressDimension | null;
  hoveredNodeId: string | null;
  isCollapsed: boolean;
  generationPhase: 'idle' | 'pass1' | 'pass2' | 'ready';

  // Actions
  addNode: (node: GraphNode) => void;
  addEdge: (edge: GraphEdge) => void;
  updateStability: (nodeId: string, stability: GraphNode['stability']) => void;
  setPositions: (positions: Record<string, { x: number; y: number }>) => void;
  setActiveStress: (dim: StressDimension | null) => void;
  collapseToReality: () => void;
  reset: () => void;
}

// Derived selectors (outside store, compute on read)
export const selectVisibleNodes = (state: GraphState) =>
  state.isCollapsed
    ? state.nodes.filter(n => !n.isSpeculative)
    : state.nodes;

export const selectNodeStyle = (node: GraphNode, stress: StressDimension | null) => {
  if (!stress) return 'default';
  const score = node.stability[stress];
  if (score >= 0.7) return 'stable';
  if (score >= 0.4) return 'uncertain';
  return 'fragile';
};
```

---

## 5. Component Structure

Each component owns its styles. No global stylesheet except CSS variables.

```
GraphNode/
  GraphNode.tsx        # Component
  GraphNode.module.css # Scoped styles
  GraphNode.types.ts   # Local types (if complex)
  index.ts             # Re-export
```

```tsx
// GraphNode.tsx — the pattern
import { motion } from 'framer-motion';
import styles from './GraphNode.module.css';
import type { GraphNode as GraphNodeType } from '../../lib/types';

interface Props {
  node: GraphNodeType;
  position: { x: number; y: number };
  styleVariant: 'default' | 'stable' | 'uncertain' | 'fragile';
  onHover: (id: string | null) => void;
}

export function GraphNode({ node, position, styleVariant, onHover }: Props) {
  return (
    <motion.g
      layout
      layoutId={node.id}
      transform={`translate(${position.x}, ${position.y})`}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onHoverStart={() => onHover(node.id)}
      onHoverEnd={() => onHover(null)}
      className={styles[styleVariant]}
    >
      {/* SVG node content */}
    </motion.g>
  );
}
```

---

## 6. Environment Variables

```bash
# .env.local (never commit)
ANTHROPIC_API_KEY=sk-ant-...
VITE_API_URL=http://localhost:3001

# .env.example (commit this)
ANTHROPIC_API_KEY=your_key_here
VITE_API_URL=http://localhost:3001
```

Access in code:
```typescript
// Backend only
const apiKey = process.env.ANTHROPIC_API_KEY;

// Frontend — only VITE_ prefixed vars
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 7. Error Handling for LLM Responses

LLMs produce malformed JSON. Always validate before using.

```typescript
import { z } from 'zod';

const GraphNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['root', 'primary', 'secondary']),
  branch: z.enum(['user', 'useCases', 'systemType', 'value', 'risks', 'dependencies']),
  title: z.string().max(40),
  insight: z.string().max(120),
  breakPoint: z.string().max(200),
  isSpeculative: z.boolean(),
  stability: z.object({
    trust: z.number().min(0).max(1),
    scale: z.number().min(0).max(1),
    latency: z.number().min(0).max(1),
    retention: z.number().min(0).max(1),
    cost: z.number().min(0).max(1),
    regulation: z.number().min(0).max(1),
  }).optional(),
});

// In API routes — validate before emitting to client
const parsed = GraphNodeSchema.safeParse(rawNode);
if (!parsed.success) {
  console.error('Invalid node from LLM:', parsed.error);
  continue; // Skip malformed nodes, don't crash
}
emit('node', parsed.data);
```

---

## 8. GitHub Pages Deployment

The frontend is a static Vite build deployed to GitHub Pages.
The backend runs on Railway and is called via `VITE_API_URL`.

Key config:
```ts
// vite.config.ts
export default defineConfig({
  base: '/ideagraph/',  // Must match GitHub repo name
  build: { outDir: 'dist' },
});
```

The `deploy.yml` workflow:
1. Triggers on push to `main`
2. Builds frontend with `vite build`
3. Deploys `dist/` to `gh-pages` branch
4. Backend deploys separately via Railway's GitHub integration

---

## 9. Type Safety for Graph Data

```typescript
// src/lib/types.ts — single source of truth for types

export type StressDimension = 'trust' | 'scale' | 'latency' | 'retention' | 'cost' | 'regulation';
export type NodeType = 'root' | 'primary' | 'secondary';
export type BranchType = 'user' | 'useCases' | 'systemType' | 'value' | 'risks' | 'dependencies';
export type EdgeType = 'hierarchical' | 'causal';
export type StyleVariant = 'default' | 'stable' | 'uncertain' | 'fragile';
export type GenerationPhase = 'idle' | 'pass1' | 'pass2' | 'ready';

export interface GraphNode {
  id: string;
  type: NodeType;
  branch: BranchType;
  title: string;
  insight: string;
  breakPoint: string;
  isSpeculative: boolean;
  stability: Record<StressDimension, number>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

---

## 10. Testing Philosophy

This project prioritizes integration tests over unit tests for the graph layer.

- Unit test: pure utility functions in `src/lib/`
- Integration test: full generation → graph state flow (mock the LLM API)
- Visual test: Storybook stories for each node style variant
- No unit tests for D3 simulation math — trust D3

```bash
# Run tests
npm test

# Storybook
npm run storybook
```
