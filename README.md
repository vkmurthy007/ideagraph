# IdeaGraph

A spatial reasoning environment that takes a product idea and renders its underlying
structure as an interactive, force-directed graph. Explore use cases, risks, system
topology, and dependencies — then apply stress overlays to see where the idea breaks.

**[Live demo →](https://your-username.github.io/ideagraph/)**

---

## What It Does

You type a product idea. The system grows a graph of its structure. You explore it.

- **Force-directed graph** — nodes settle into a spatial arrangement that reflects the idea's topology
- **Stress overlays** — toggle constraints (Trust, Scale, Cost, Regulation) to see which parts weaken
- **Break points** — hover any node to see exactly where and why it fails first
- **Collapse to Reality** — remove speculative branches to reveal what the product actually becomes

This is not a report generator. It is a thinking environment.

---

## Architecture

```
Frontend: React 18 + D3-force + Framer Motion (GitHub Pages)
Backend:  Node.js + Express + SSE (Railway)
LLM:      Claude claude-sonnet-4-20250514 via Anthropic API
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design.

---

## Project Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Operating instructions for Claude Code |
| `PRD.md` | Live product requirements — edit to drive development |
| `ask.md` | Brainstorming and open questions |
| `SKILL.md` | Coding patterns and conventions |
| `PROMPTS.md` | All LLM prompts, versioned |
| `ARCHITECTURE.md` | System design and decisions |
| `AGENTS.md` | Agentic task instructions |
| `CHANGELOG.md` | What changed and why |

---

## Local Development

### Prerequisites
- Node.js 20+
- An Anthropic API key ([get one here](https://console.anthropic.com))

### Setup

```bash
# Clone
git clone https://github.com/your-username/ideagraph.git
cd ideagraph

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Run (starts both frontend and backend)
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

---

## Deployment

### Frontend → GitHub Pages

Automatic. Every push to `main` triggers the GitHub Actions workflow in
`.github/workflows/deploy.yml` which builds and deploys to GitHub Pages.

**First-time setup:**
1. Go to repo Settings → Pages
2. Set source to "GitHub Actions"
3. Add `VITE_API_URL` to repo Settings → Secrets (your Railway backend URL)
4. Update `base` in `vite.config.ts` to match your repo name

### Backend → Railway

1. Create a new Railway project
2. Connect your GitHub repo
3. Set root directory to `/` (Railway will detect the Node app)
4. Add environment variable: `ANTHROPIC_API_KEY`
5. Railway auto-deploys on push to `main`

---

## Contributing / Modifying

This project is designed to be driven by `PRD.md`. To change product behavior:

1. Edit `PRD.md` with your changes
2. Add an entry to `CHANGELOG.md`
3. If using Claude Code: it will read CLAUDE.md and make the corresponding code changes

To change LLM prompts: edit `PROMPTS.md` first, then update `src/lib/prompts.ts`.
