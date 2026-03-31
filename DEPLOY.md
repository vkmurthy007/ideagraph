# DEPLOY.md — How to Get a Live URL

Two services. 15 minutes.

- **GitHub Pages** — hosts the React frontend (free, automatic on push)
- **Railway** — hosts the Express backend with your Anthropic API key (free tier available)

---

## Step 1 — Create the GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Name it `ideagraph` (or anything — you'll use the name in Step 3)
3. Set to **Public** (required for free GitHub Pages)
4. **Do not** initialize with README, .gitignore, or license — the project already has these
5. Click **Create repository**

---

## Step 2 — Push the code

In your terminal, from inside the `ideagraph/` folder:

```bash
# Install dependencies and generate lockfile first
npm install

# Initialize git and push
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values.

---

## Step 3 — Deploy the backend to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your `ideagraph` repo
4. Railway will detect the Node.js app automatically via `railway.json`
5. Once deployed, go to the service **Settings → Networking → Generate Domain**
   - This gives you a URL like `https://ideagraph-api.up.railway.app`
   - Copy it — you'll need it in Step 4
6. Go to **Variables** tab and add:

```
ANTHROPIC_API_KEY = sk-ant-your-key-here
FRONTEND_URL     = https://YOUR_USERNAME.github.io
PORT             = 3001
```

Railway auto-redeploys on every push to `main`.

---

## Step 4 — Enable GitHub Pages

1. Go to your GitHub repo → **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

Now add the two variables the build needs:

4. Go to **Settings → Variables → Actions** (note: Variables, not Secrets — these aren't sensitive)
5. Add:

```
VITE_BASE_PATH = /ideagraph/
VITE_API_URL   = https://ideagraph-api.up.railway.app
```

> Replace `ideagraph` in `VITE_BASE_PATH` with your actual repo name if different.
> Replace the Railway URL with the one you copied in Step 3.

---

## Step 5 — Trigger the first deploy

The GitHub Actions workflow runs automatically on push to `main`.
If it didn't run yet:

1. Go to your repo → **Actions** tab
2. Click **Deploy to GitHub Pages** → **Run workflow** → **Run workflow**
3. Watch it build (takes ~2 minutes)

---

## Step 6 — Your live URL

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

Example: `https://johndoe.github.io/ideagraph/`

Share this with the Google team.

---

## Verifying everything works

```bash
# Check backend is alive
curl https://ideagraph-api.up.railway.app/api/health

# Expected response:
# {"status":"ok","timestamp":"...","model":"claude-sonnet-4-20250514"}
```

If the frontend loads but graph generation fails, open browser DevTools → Network tab and look for the `/api/generate` request. Common causes:
- `VITE_API_URL` not set or wrong value
- `ANTHROPIC_API_KEY` not set in Railway
- CORS: your GitHub Pages URL not matching the allowed origins in `api/server.ts`

---

## Updating after that

```bash
# Make changes, then:
git add .
git commit -m "what changed"
git push
```

Both services redeploy automatically.

---

## CORS note

If your GitHub Pages URL is `https://YOUR_USERNAME.github.io`, the CORS config in
`api/server.ts` uses a regex that matches `*.github.io` — no changes needed.

If you're using a custom domain, add it to the `cors` origins array in `api/server.ts`:

```typescript
origin: [
  'http://localhost:5173',
  /https:\/\/.*\.github\.io$/,
  'https://your-custom-domain.com',  // ← add this
  ...
]
```

Then commit and push — Railway will redeploy.
