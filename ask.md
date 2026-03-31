# ask.md — Brainstorm & Open Questions

This file is a shared thinking surface between you and Claude.

**How it works:**
- Claude adds questions under `## Open Questions` when something in the build is ambiguous
- You answer inline, move resolved questions to `## Resolved`, and add your own questions anytime
- This replaces back-and-forth chat for decisions that need to be recorded

---

## How to Use This File

```
## Open Questions
### [Q-001] Short question title
**Asked by:** Claude | **Date:** YYYY-MM-DD
**Context:** Why this question matters
**Options:**
  - Option A: ...
  - Option B: ...
**My lean:** Which option and why
**Your answer:** [you fill this in]
```

---

## Open Questions

### [Q-001] What happens when the graph is too simple?
**Asked by:** Claude | **Date:** 2025-03-31
**Context:** Some ideas — "a to-do app", "notes for myself" — will produce thin graphs.
3 secondary nodes total, no interesting cross-edges. The product's value depends on
structural richness. A sparse graph might feel like the system failed.
**Options:**
  - A: Accept it — a simple idea *should* produce a simple graph. That's signal.
  - B: Prompt engineer for minimum complexity (force 4+ nodes per branch)
  - C: Show a "This idea is narrower than it looks" state with a prompt to push further
**My lean:** A — don't fight the output. But worth testing with real simple ideas first.
**Your answer:**

---

### [Q-002] Should cross-edges be visible by default or revealed on interaction?
**Asked by:** Claude | **Date:** 2025-03-31
**Context:** Cross-edges are the most insightful part of the graph — they show non-obvious
causal relationships across branches. But showing all of them immediately may create
visual noise before the user understands the primary structure.
**Options:**
  - A: Hidden by default, revealed when user hovers a primary branch
  - B: Visible from the start, but lighter/thinner than hierarchical edges
  - C: Revealed progressively after primary + secondary nodes finish loading
**My lean:** C — let the structure settle first, then layer in the relationships.
**Your answer:**

---

### [Q-003] Does the root node need a description, or just the original text?
**Asked by:** Claude | **Date:** 2025-03-31
**Context:** The root node currently shows the user's raw input verbatim. Some inputs
are well-phrased ("AI triage tool for rural clinics"), others are vague ("app for doctors").
Should the system normalize the root label, or preserve the user's exact words?
**Options:**
  - A: Always show verbatim input — it's their idea in their words
  - B: LLM generates a "sharpened" root label, show original as subtitle
  - C: Show verbatim but add a one-line insight to the root node like secondary nodes
**My lean:** B — the sharpening moment is itself valuable product feedback.
**Your answer:**

---

### [Q-004] How do we handle the latency gap between Pass 1 and Pass 2?
**Asked by:** Claude | **Date:** 2025-03-31
**Context:** Pass 1 builds the graph skeleton (~3s). Pass 2 enriches with stability + cross-edges (~4s).
There's a window where the graph is visible but "unresolved" — nodes exist but stress overlays
don't work yet. How do we make this feel intentional, not broken?
**Options:**
  - A: Show nodes in a neutral "loading" state with a subtle pulse animation
  - B: Disable the stress overlay toggle bar until Pass 2 completes
  - C: Show a minimal progress indicator ("Reading for fragility...")
  - D: Let nodes appear in unresolved state — no indicator, it just resolves
**My lean:** C + B — communicate that *something* is being computed, disable controls until ready.
**Your answer:**

---

### [Q-005] Should "Collapse to Reality" be reversible?
**Asked by:** Claude | **Date:** 2025-03-31
**Context:** Collapsing removes speculative nodes. It's the product's most decisive gesture.
If reversible, it's a toggle ("expand/collapse"). If not, it's a commitment — the user
has acknowledged what this product actually is.
**Options:**
  - A: Irreversible within a session — start over to see the full graph again
  - B: Reversible toggle — "Collapse" / "Expand" 
  - C: Irreversible but with an undo (10 second window)
**My lean:** A — the irreversibility is the point. It makes the gesture meaningful.
**Your answer:**

---

### [Q-006] What is the right density of cross-edges?
**Asked by:** Claude | **Date:** 2025-03-31
**Context:** The LLM prompt says 4–8 cross-edges. Too few = the graph feels like a tree.
Too many = visual noise, users can't follow the lines. This number was chosen intuitively.
**Options:**
  - A: Keep 4–8, calibrate through user testing
  - B: Make it idea-dependent — complex ideas get more edges
  - C: User controls density with a slider (breaks the "no UI chrome" principle)
**My lean:** B — prompt the model to calibrate to complexity, not a fixed count.
**Your answer:**

---

### [Q-007] Do we want a shareable URL for v1?
**Asked by:** Claude | **Date:** 2025-03-31
**Context:** No save/share was scoped out of v1 in the PRD. But for a portfolio demo and
for the Google PM role application specifically, sharing a live session with a reviewer
is high value. Could be as simple as encoding the graph JSON in the URL hash.
**Options:**
  - A: Keep out of v1 as specified — stay focused
  - B: URL-hash sharing only — no backend, encode graph state in URL (lossy but instant)
  - C: Add a "Copy link" button that serializes the full graph to a short URL via a KV store
**My lean:** B — URL hash is 2 hours of work, adds significant demo value, doesn't require auth.
**Your answer:**

---

## Your Questions

*Add anything you want to think through here. I'll respond inline.*

---

## Resolved

*(Answered questions move here with their resolution)*
