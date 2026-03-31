# IdeaGraph — Product Requirements Document
**Version:** 1.0 | **Status:** Ready for Build | **Stack:** React + D3-force + Claude API

---

## 0. What This Is (And Isn't)

This is not a PRD for a report generator that wraps GPT output in a nice UI.

This is a PRD for a **spatial reasoning environment** — one that takes a product idea and makes its structure *visible and manipulable*. The core interaction is exploration, not evaluation. The output is clarity, not a verdict.

It is built for the moment when someone has an idea and doesn't know what it actually *is* yet.

---

## 1. Problem Statement (First Principles)

Most product ideas fail not because they're bad, but because they're **understood incorrectly for too long**.

Teams discuss ideas as abstractions — slides, memos, conversations — which preserves ambiguity. The structure of an idea (its users, failure modes, dependencies, system topology) stays implicit until it's too late to matter.

The root failure is not lack of process. It's that **ideas have no form**. They can't be held, turned, stress-tested, or collapsed. You can only describe them.

This product solves one thing: **it gives an idea a form you can interact with.**

---

## 2. Core Experience

### 2.1 Entry Point

Single centered input field. No onboarding. No instructions.

```
"What are you thinking of building?"
```

The emptiness is intentional. The product starts when the user commits language to an idea.

### 2.2 Output

A **living graph** that grows progressively from the center outward. Not a mindmap. Not a flowchart. A force-directed network that settles into a spatial arrangement that reflects the idea's topology.

The graph should feel like the idea is being *discovered*, not generated.

---

## 3. Graph Architecture

### 3.1 Node Types

| Layer | Description | Count |
|-------|-------------|-------|
| Root | The original idea, verbatim | 1 |
| Primary | Core dimensions (User, Use Cases, System Type, Value, Risks, Dependencies) | 5–6 |
| Secondary | Specific instantiations of each primary | 3–4 per primary |
| Cross-edges | Causal connections *between* secondary nodes across branches | 4–8 |

> **Design decision:** Cross-edges are the most important structural element and the hardest to generate. They represent the non-obvious causal relationships that actually determine viability — e.g., "Clinician trust" → "Misdiagnosis risk" → "Regulatory exposure." These must be generated explicitly in the LLM pass, not inferred by the UI.

### 3.2 Node Data Model

```typescript
interface GraphNode {
  id: string;
  type: 'root' | 'primary' | 'secondary';
  branch: 'user' | 'useCases' | 'systemType' | 'value' | 'risks' | 'dependencies';
  title: string;           // ≤ 4 words
  insight: string;         // ≤ 15 words, no jargon, reads like product truth
  breakPoint: string;      // causal failure statement for hover tooltip
  stability: {             // 0–1 per stress dimension, generated at creation time
    trust: number;
    scale: number;
    latency: number;
    retention: number;
    cost: number;
    regulation: number;
  };
  isSpeculative: boolean;  // used by Collapse to Reality
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'hierarchical' | 'causal';  // causal = cross-branch
  label?: string;                    // optional short connector ("enables", "causes", "blocks")
}
```

### 3.3 Layout Engine

Use **D3-force**, not React Flow.

React Flow is optimized for flowcharts and DAGs with manual positioning. D3-force produces an organic, physics-based layout where nodes settle into a spatial arrangement that reflects their relationships. This is the right tool for a system meant to feel like it's *thinking*.

Force parameters:
- Strong center force on root node
- Charge repulsion between all nodes (prevents overlap)
- Link distance varies by edge type: hierarchical = 120px, causal = 200px
- Collision radius proportional to node size

---

## 4. Generation Pipeline

### 4.1 Two-Pass LLM Architecture

**Why two passes:** A single pass conflates structure generation with relationship analysis. The first pass builds the graph skeleton. The second pass, which sees the full skeleton, generates cross-edges, stability scores, and break points — all of which require global awareness of the graph.

**Pass 1 — Structure**

```
Input: raw idea string
Output: root, primary nodes, secondary nodes per branch
Latency target: < 3s
Streaming: yes (nodes appear as they're generated)
```

**Pass 2 — Relationships + Stability**

```
Input: full graph from Pass 1
Output: cross-edges with labels, stability scores per node per dimension, break points
Latency target: < 4s
Streaming: nodes update their visual state as scores arrive
```

### 4.2 Pass 1 System Prompt

```
You are a product analyst that thinks in systems, not summaries.

Given a product idea, generate its structural graph. Return only valid JSON.

Rules:
- Titles: 2–4 words, concrete nouns, no verbs unless essential
- Insights: ≤ 15 words, reads like a product truth a PM would put on a whiteboard
- isSpeculative: true if this node depends on unproven assumptions or network effects
- Generate 3–4 secondary nodes per primary branch
- Do not include any commentary, markdown, or explanation outside the JSON

Output schema: [see GraphNode[] type above, excluding stability and breakPoint]
```

### 4.3 Pass 2 System Prompt

```
You are given a product idea graph. Your job is to:
1. Find non-obvious causal connections between secondary nodes across different branches
2. Assign stability scores (0–1) for each secondary node across 6 stress dimensions
3. Write a break point for each secondary node

Stability scoring rules:
- 1.0 = stable under this constraint (this node survives or strengthens)
- 0.0 = this node is the first to fail under this constraint
- Score relative to the other nodes in this graph, not in absolute terms

Break point rules:
- Format: "Breaks here: [cause] → [consequence]"
- Must be causal, not descriptive
- Must be specific to this node, not generic
- ≤ 20 words

Cross-edge rules:
- Only include edges where the causal relationship is non-obvious
- Avoid edges that simply restate the hierarchy
- Label should be one of: "enables", "blocks", "accelerates", "undermines", "requires", "reveals"
- Generate 4–8 cross-edges maximum

Return only valid JSON. No commentary.
```

### 4.4 Streaming Strategy

Use **Server-Sent Events** from the backend. The frontend should render nodes as they stream in:

1. Root node appears immediately (0ms)
2. Primary nodes fade in sequentially (200ms stagger)
3. Secondary nodes grow in by branch (100ms stagger within branch)
4. Cross-edges draw themselves last (after all nodes are placed)
5. Stability data updates node visual state silently

Each node renders in an "unresolved" state (neutral color, thin border) until stability data arrives from Pass 2.

---

## 5. Stress Overlay System

### 5.1 Mechanism

When a stress overlay is activated, the UI reads the `stability[dimension]` value for each secondary node and applies a visual transform.

```typescript
const getNodeStyle = (node: GraphNode, activeStress: StressDimension | null) => {
  if (!activeStress) return defaultStyle;
  
  const score = node.stability[activeStress];
  
  if (score >= 0.7) return stableStyle;       // subtle green tint, normal opacity
  if (score >= 0.4) return uncertainStyle;    // yellow tint, 80% opacity
  return fragileStyle;                        // red tint, 50% opacity, edge flicker
};
```

**No numbers are ever shown to the user.** The visual delta communicates relative fragility — the spatial pattern of what weakens and what holds is the insight.

### 5.2 Stress Dimensions

| Dimension | What it simulates |
|-----------|------------------|
| Trust | Can users verify correctness? Do they have prior mental models? |
| Scale | Does unit economics hold? Does latency degrade? |
| Latency | Does this need real-time inference? Is that viable? |
| Retention | Does value compound with use, or is it one-shot? |
| Cost | What's the marginal cost of the core operation at scale? |
| Regulation | Is this in a regulated domain? Who bears liability? |

### 5.3 Visual Behavior

- Fragile nodes: opacity 50%, edge stroke-dasharray animates (fragmented look)
- Uncertain nodes: opacity 80%, subtle yellow fill
- Stable nodes: opacity 100%, faint green ring
- Cross-edges between fragile nodes: stroke becomes lighter and thinner
- Root node: never changes — it's the anchor

Motion should feel like **pressure passing through a system**, not a filter being applied.

---

## 6. Signature Interactions

### 6.1 "Where This Breaks First" Tooltip

**Trigger:** Hover on any secondary node

**Output:** Small floating card, bottom-left of node

```
Breaks here: user cannot verify correctness → trust collapses before value is demonstrated
```

Rules:
- Never show scores or ratings
- Must be causal (X → Y), not descriptive
- ≤ 20 words
- Disappears immediately on mouse-leave (no linger)

### 6.2 Expand on Click

Clicking a secondary node expands it inline — showing 2–3 additional detail nodes. These are generated on-demand (third LLM call), not pre-generated.

This keeps the initial graph clean and fast. Users pull depth when they need it.

### 6.3 Collapse to Reality

**Button placement:** Bottom-center, understated

**Behavior:**
1. All nodes where `isSpeculative: true` fade out and are removed
2. Graph re-runs force simulation with remaining nodes (re-settles)
3. A "seed insight" appears below the root node — one sentence capturing what this product actually is

**Seed insight generation** (separate, lightweight LLM call):
```
Given this collapsed graph, write one sentence that describes what this product actually is.
Not what it could be — what it will become given real constraints.
Format: "This is [concrete description], not [what it was mistaken for]."
```

Example output:
> "This is a triage decision-support tool for clinicians, not a diagnosis agent."

This is the most valuable sentence the system produces. It should feel like clarity landing.

---

## 7. Technical Architecture

### 7.1 Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend framework | React 18 + TypeScript | Concurrent rendering for streaming UX |
| Graph rendering | D3-force v7 | Physics layout; not constrained to flowchart topology |
| Animation | Framer Motion | Declarative, performant, handles layout animations |
| State management | Zustand | Lightweight; graph state doesn't need React context overhead |
| Backend | Node.js + Express | SSE support; minimal overhead |
| LLM | Claude claude-sonnet-4-20250514 | Structured output reliability; handles long JSON schemas |
| Streaming | Server-Sent Events | Simpler than WebSockets for unidirectional stream |
| Deployment | Vercel (frontend) + Railway (backend) | Fast iteration |

### 7.2 File Structure (Claude Code)

```
/
├── app/
│   ├── components/
│   │   ├── Graph/
│   │   │   ├── GraphCanvas.tsx      # D3 + SVG container
│   │   │   ├── GraphNode.tsx        # Individual node with Framer Motion
│   │   │   ├── GraphEdge.tsx        # Edge with draw animation
│   │   │   └── CrossEdge.tsx        # Causal edge (different visual treatment)
│   │   ├── Controls/
│   │   │   ├── StressBar.tsx        # Stress overlay toggles
│   │   │   └── CollapseButton.tsx
│   │   ├── Overlays/
│   │   │   ├── BreakTooltip.tsx     # Hover break point card
│   │   │   └── SeedInsight.tsx      # Post-collapse one-liner
│   │   └── Input/
│   │       └── IdeaInput.tsx        # Entry point
│   ├── hooks/
│   │   ├── useGraphStream.ts        # SSE consumer + graph state updater
│   │   ├── useStressOverlay.ts      # Stress toggle + visual state computation
│   │   └── useForceLayout.ts        # D3-force simulation manager
│   ├── store/
│   │   └── graphStore.ts            # Zustand store
│   └── lib/
│       ├── graphUtils.ts            # Node/edge helpers
│       └── colorUtils.ts            # Stability → color mapping
├── api/
│   ├── generate.ts                  # Pass 1 + SSE
│   ├── enrich.ts                    # Pass 2 + SSE  
│   ├── expand.ts                    # On-demand node expansion
│   └── collapse.ts                  # Seed insight generation
└── PRD.md                           # This document
```

### 7.3 D3 + React Integration Pattern

D3 and React both want to own the DOM. The clean pattern here:

- **React owns the component tree** (nodes, edges as JSX)
- **D3 owns only the position computation** (force simulation runs separately, updates a positions map in Zustand)
- React re-renders when positions update

```typescript
// useForceLayout.ts — the key hook
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(edges).distance(d => d.type === 'causal' ? 200 : 120))
  .force('charge', d3.forceManyBody().strength(-300))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(50));

simulation.on('tick', () => {
  useGraphStore.setState({ positions: extractPositions(simulation.nodes()) });
});
```

---

## 8. Visual Design System

### 8.1 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0F0F0F` | Canvas background (dark mode default) |
| `--surface` | `#1A1A1A` | Node fill |
| `--border` | `#2E2E2E` | Node stroke |
| `--text-primary` | `#E8E8E8` | Node titles |
| `--text-secondary` | `#888888` | Insights |
| `--edge` | `#3A3A3A` | Default edge |
| `--stable` | `#2D5A3D` | Stable node under stress |
| `--uncertain` | `#5A4A1A` | Uncertain node |
| `--fragile` | `#5A1A1A` | Fragile node |
| `--accent` | `#C8A96E` | Root node accent, hover states |

No bright colors. No saturation. The graph should feel like a working surface, not a product showcase.

### 8.2 Typography

```css
--font: 'Inter', system-ui, sans-serif;
--node-title: 500 13px/1.3;
--node-insight: 300 11px/1.5;
--tooltip: 400 12px/1.6;
```

### 8.3 Motion Principles

| Interaction | Animation |
|------------|-----------|
| Node appear | scale(0.6→1) + opacity(0→1), spring, 400ms |
| Edge draw | stroke-dashoffset, 600ms ease-out |
| Stress overlay | opacity transition, 300ms, staggered by fragility score |
| Node expand | layout animation via Framer Motion's `layoutId` |
| Collapse to Reality | nodes exit with scale(1→0), 200ms stagger |

**Rule:** Motion communicates state, never decorates. Every animation should be answering the question "what just happened to the system?"

---

## 9. LLM Failure Modes + Mitigations

| Failure Mode | Mitigation |
|-------------|------------|
| Generic insights ("This has risks") | System prompt includes 3 examples of bad vs. good insights. Few-shot > rules. |
| Cross-edges that are just hierarchy | Explicitly prohibit edges between parent and child nodes in prompt |
| Stability scores all cluster at 0.5 | Instruct model to use full 0–1 range and to have at least one node at <0.3 and one at >0.8 per dimension |
| Insight length creep | Validate in backend; truncate at 15 words with `...` if needed |
| Invalid JSON | Use structured output / JSON mode; backend validates schema before streaming to client |

---

## 10. Success Criteria

These are not launch metrics. They're signals that the product is working as intended.

**Session quality signals (qualitative, observed in usability testing):**
- User says "oh, I hadn't thought about that" within first 90 seconds
- User toggles at least 2 stress overlays and pauses on the graph
- User reads a break point tooltip and changes their node focus
- User clicks "Collapse to Reality" and reacts to the seed insight

**Behavioral signals (quantitative):**
- Median session length > 4 minutes (exploration, not bounce)
- Cross-edge hover rate > 30% of sessions (users are finding the non-obvious connections)
- Collapse to Reality used in > 40% of sessions
- Stress overlay engagement: median of 2+ overlays toggled per session

**Anti-metrics (things that would indicate the product is failing its purpose):**
- Users screenshot the graph without interacting (static consumption, not exploration)
- Users try to summarize the graph in text immediately after generation (reverting to abstraction)
- Users ask for a "score" or "rating"

---

## 11. What We're Not Building (Scope Lock)

This is a constraint list, not a backlog.

- ❌ No save/share in v1 (adds auth complexity, distracts from core loop)
- ❌ No multi-idea comparison view (different product)
- ❌ No team collaboration mode
- ❌ No export to slide/doc/PRD (antithetical to the product philosophy)
- ❌ No history or saved graphs
- ❌ No scoring, rating, or evaluation language anywhere in the UI

The product does one thing. It reveals the structure of a single idea in a single session.

---

## 12. Build Order (for Claude Code)

Build in this sequence to avoid rework:

1. **Static graph render** — hardcode one example graph, get D3-force layout + React rendering working
2. **Node + edge components** — visual design, hover states, break tooltips
3. **Stress overlay system** — using hardcoded stability scores first
4. **LLM Pass 1** — streaming backend, node generation, client-side SSE consumer
5. **LLM Pass 2** — enrichment streaming, stability scores updating node visual state live
6. **Collapse to Reality** — node removal + force re-simulation + seed insight
7. **On-demand expansion** — third LLM call for click-to-expand depth
8. **Polish** — motion refinement, edge draw animations, input state

**Don't build the input screen until step 6.** Work with a hardcoded idea string until the graph system is solid.

---

## 13. Open Questions (Resolve Before Building)

| Question | Options | Recommendation |
|----------|---------|----------------|
| Dark mode only or toggle? | Dark only / Light only / Toggle | Dark only for v1. The color semantics (red/green/yellow) are designed for dark. |
| Mobile support? | Yes / No / Responsive-only | Desktop only for v1. Force-directed graphs require precision interaction. |
| How to handle very simple ideas? | Same flow / Simplified graph | Same flow. A simple idea should produce a simple graph — that's signal, not failure. |
| LLM provider? | Claude / GPT-4o / Gemini | Claude claude-sonnet-4-20250514 — best JSON fidelity for complex schemas |
| Where does the backend live? | Same repo / Separate | Same repo, `/api` directory. Monorepo for fast iteration. |

---

*This document is a build artifact, not a specification. If the code contradicts this doc, the code wins — but the philosophy doesn't change.*
