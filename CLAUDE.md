# CLAUDE.md — Operating Instructions for Claude Code

This file is your source of truth. Read it before every task.
When PRD.md changes, this file tells you how to interpret and act on those changes.

---

## What This Project Is

IdeaGraph is a spatial reasoning environment that takes a product idea and renders its
underlying structure as an interactive, force-directed graph. Users explore the idea,
apply stress overlays, and collapse it to its buildable core.

It is NOT a dashboard. NOT a report generator. NOT a chat UI.
Every code decision should be filtered through that constraint.

---

## How to Read PRD.md

PRD.md is the live specification. When it changes:

1. Read the diff — understand *what* changed and *why* (check CHANGELOG.md for context)
2. Identify which files are affected using ARCHITECTURE.md as a map
3. Check SKILL.md for the coding patterns that apply
4. Make the minimal change that satisfies the spec — do not gold-plate
5. Update CHANGELOG.md with what you changed

**PRD.md is authoritative. If code contradicts PRD.md, fix the code.**
**If PRD.md seems wrong, flag it in ask.md — do not silently ignore it.**

---

## Project Constraints (Non-Negotiable)

- No scores, ratings, or numbers shown to users — ever
- No dashboards, side panels, or data tables in the UI
- No export functionality (antithetical to product philosophy)
- Dark mode only — the color semantics require it
- Desktop only for v1 — force graphs require precision interaction
- All LLM prompts live in PROMPTS.md, not scattered in code

---

## Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Frontend | React 18 + TypeScript | Strict mode on |
| Graph | D3-force v7 | Owns positions only, React owns DOM |
| Animation | Framer Motion | Declarative; no CSS keyframes for graph motion |
| State | Zustand | One store: `src/store/graphStore.ts` |
| Backend | Node.js + Express | SSE for streaming; `api/` directory |
| LLM | Claude claude-sonnet-4-20250514 | claude-sonnet-4-20250514 only — do not substitute |
| Deploy | GitHub Pages (frontend) + Railway (backend) | See deploy.yml |

---

## File Ownership Rules

| File | Owner | Rule |
|------|-------|------|
| `PROMPTS.md` | Human | Never edit prompts inline in code. Always update PROMPTS.md first. |
| `PRD.md` | Human | Read-only for Claude Code unless explicitly asked to update |
| `ask.md` | Shared | Claude Code adds questions; human answers them |
| `ARCHITECTURE.md` | Claude Code | Update when you add or change system topology |
| `CHANGELOG.md` | Claude Code | Update after every meaningful change |
| `SKILL.md` | Human | Coding patterns; read before writing code |

---

## Code Style

- TypeScript strict mode — no `any`, no `as` casts without comment explaining why
- Components: functional only, no class components
- No inline styles — use CSS modules (`Component.module.css`) alongside each component
- All D3 simulation logic in `src/hooks/useForceLayout.ts` — nowhere else
- All API calls in `src/hooks/` — never in components directly
- Constants go in `src/lib/constants.ts`

---

## When You're Unsure

1. Check `ask.md` — the question may already be there with an answer
2. If not, add the question to `ask.md` under `## Open Questions`
3. Make the most conservative choice and leave a `// TODO: resolve in ask.md` comment
4. Do not guess at product intent — this product has a clear philosophy, deviation is visible

---

## Build Order

Follow this sequence. Do not skip ahead.

- [x] Phase 1: Static graph render with hardcoded data
- [x] Phase 2: Node + edge visual components + stress overlay (hardcoded scores)
- [x] Phase 5: Collapse to Reality — node removal + re-simulation + seed insight
- [x] Phase 7: Input screen + full user flow
- [x] Phase 3: LLM Pass 1 — streaming backend + SSE consumer
- [x] Phase 4: LLM Pass 2 — enrichment, stability scores update live
- [x] Phase 6: On-demand node expansion (click to deepen)
- [x] Phase 8: Polish — motion, edge draw, empty states

Check the box in this file when a phase is complete.
