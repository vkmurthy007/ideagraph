# AGENTS.md — Agentic Task Instructions

This file tells Claude Code how to operate autonomously on this codebase.
Read before starting any multi-step task.

---

## Operating Principles

1. **Read before writing.** Always read CLAUDE.md + the relevant section of PRD.md 
   before making changes. Never code from memory of a previous session.

2. **One phase at a time.** Check the build order in CLAUDE.md. Do not start Phase N+1 
   until Phase N's checkbox is checked.

3. **Update files after changes.** After completing meaningful work:
   - Add an entry to CHANGELOG.md
   - Update ARCHITECTURE.md if system topology changed
   - Check the completed phase box in CLAUDE.md

4. **Ask before guessing.** If a requirement is ambiguous, add it to ask.md and 
   implement the most conservative interpretation. Leave a comment.

5. **Never modify PROMPTS.md source of truth inline in code.** If a prompt needs 
   to change, update PROMPTS.md first, then `src/lib/prompts.ts`.

---

## How to Handle a PRD Update

When you see PRD.md has changed:

```
1. Read the full diff (or re-read PRD.md if diff is unavailable)
2. Identify: what changed? (feature added, spec tightened, feature removed)
3. Cross-reference ARCHITECTURE.md: which files are likely affected?
4. Check ask.md: does this change answer any open questions?
5. Make the minimal code change to satisfy the updated spec
6. Update CHANGELOG.md: describe what changed and why
7. If the change affects architecture, update ARCHITECTURE.md
```

---

## Task Types and How to Handle Them

### "Build Phase X"
1. Read CLAUDE.md build order — confirm this phase is next
2. Read relevant SKILL.md patterns for this phase
3. Read relevant ARCHITECTURE.md sections
4. Build incrementally — commit-sized chunks, not everything at once
5. At the end: check phase box, update CHANGELOG.md

### "Fix a bug in [component]"
1. Read the component + its types
2. Understand the intended behavior from PRD.md or ARCHITECTURE.md
3. Fix the minimal thing — do not refactor while fixing
4. Add entry to CHANGELOG.md under `### Fixed`

### "Change how [feature] works"
1. This is a PRD change, not a code task
2. First ask: does PRD.md reflect this change?
3. If not, update PRD.md first, then update CHANGELOG.md, then update code
4. Never change behavior without it being reflected in PRD.md

### "Improve the prompt for [X]"
1. Update PROMPTS.md first — describe what changed and why
2. Update `src/lib/prompts.ts` to match
3. Test the new prompt with 2–3 different idea inputs
4. Document results in CHANGELOG.md

---

## File Change Policy

| File | When to change | How |
|------|---------------|-----|
| `CLAUDE.md` | Only when build order or stack changes | Human decision |
| `PRD.md` | Only when product spec changes | Human decision |
| `PROMPTS.md` | Before any prompt code change | Always update here first |
| `ARCHITECTURE.md` | After any system topology change | Claude Code maintains |
| `CHANGELOG.md` | After every meaningful change | Claude Code maintains |
| `ask.md` | When genuinely ambiguous | Claude Code adds questions |
| `src/lib/types.ts` | When data model changes | Update before components |
| `src/store/graphStore.ts` | When state shape changes | Update types first |

---

## Code Quality Gates

Before considering a phase complete:

- [ ] TypeScript compiles with zero errors (`npm run type-check`)
- [ ] No `any` types without explanatory comment
- [ ] All new components have corresponding `.module.css` file
- [ ] All LLM calls use prompts from `src/lib/prompts.ts`, not inline strings
- [ ] All new API routes have Zod validation on input and output
- [ ] CHANGELOG.md updated

---

## Context Window Management

This is an AI-native project. When context gets long:

1. Key files to re-read at start of new session: CLAUDE.md, ARCHITECTURE.md
2. Check CHANGELOG.md to understand current state
3. Check ask.md for any open decisions
4. Never assume you remember the state from a previous session

---

## Debugging LLM Output Issues

When generated graphs look wrong (generic insights, bad stability scores, etc.):

1. Log the raw LLM response to console in development
2. Check against the rules in PROMPTS.md — is the model violating them?
3. Add a few-shot example to the relevant prompt (see PROMPTS.md "Notes on Few-Shot Examples")
4. Test with 3+ different ideas before concluding a fix works
5. Document the prompt change in PROMPTS.md change log
