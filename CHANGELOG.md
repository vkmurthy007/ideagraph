# CHANGELOG.md

## [0.3.0] — 2025-03-31

### Added — Phase 6: On-demand expansion
- `src/hooks/useNodeExpand.ts` — calls /api/expand on secondary node click; streams 2–3 deeper nodes into graph; one expansion at a time; won't re-expand an already-expanded node
- Store fields: `idea`, `expandedNodeIds`, `expandingNodeId`, `setIdea`, `setExpandingNode`, `markExpanded`

### Added — Phase 8: Polish
- `src/hooks/useUrlHash.ts` — Q-007 resolved: URL hash sharing via base64 (+ gzip if browser supports CompressionStream); writes on `generationPhase → ready`; clears on reset
- `App.tsx` — restores session from URL hash on mount; passes `setIdea` to stream hook
- `GraphNode.tsx` — full rework: animated root rings; hover glow; "+" expand affordance; spinning arc during expansion; expanded dashed ring; fragile text opacity; `isExpanding` pulse
- `GraphEdge.tsx` — full rework: draw-on animation via stroke-dashoffset on mount; causal edges delay 600ms to draw after hierarchy; label shown on highlight; unresolved state; transition on stress overlay change
- `GraphCanvas.tsx` — wires `useNodeExpand` and `useUrlHash`; passes `isExpanded`/`isExpanding` to nodes
- `useGraphStream.ts` — now calls `setIdea(idea)` so expand + collapse calls have access to original idea
- `graphStore.ts` — added `idea` field and expansion state

### Changed
- `package.json` → 0.3.0

### Notes
All 8 phases complete. Full user flow:
  Input → graph grows progressively → hover to see break points →
  toggle stress overlays → click secondary node to expand depth →
  Collapse to Reality → seed insight appears →
  URL hash written automatically for sharing

---

## [0.2.0] — 2025-03-31
### Added
- Full backend: Express + SSE + all 4 API routes
- Pass 1 (generate) and Pass 2 (enrich) with Zod validation
- useGraphStream hook — SSE consumer, runs both passes in sequence
- GenerationStatus component

---

## [0.1.0] — 2025-03-31
### Added
- Initial project scaffold, all documentation files
- Static graph (Phase 1), visual components (Phase 2), Collapse to Reality (Phase 5), Input screen (Phase 7)
