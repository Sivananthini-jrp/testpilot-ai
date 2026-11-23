# Probe: autonomous software testing and bug discovery

    probe/
      backend/    FastAPI API: clone, AST analysis, test generation, sandboxed run, mutation testing, report
      frontend/   React + Vite single-page app that calls the API
      render.yaml Blueprint that deploys both as separate Render services

## Run locally
Backend (terminal 1):

    cd backend
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY=sk-ant-...     # optional
    uvicorn app.main:app --reload --port 8000

Frontend (terminal 2):

    cd frontend
    npm install
    npm run dev                             # http://localhost:5173, /api is proxied to :8000

## Deploy to Render (two services)
1. Push this folder to GitHub, then Render > New > Blueprint > select the repo.
2. Render creates `probe-api` (Docker) and `probe-web` (static site).
3. After both exist, set environment variables, then redeploy:
   - `probe-api`: `CORS_ORIGINS` = the frontend URL (e.g. https://probe-web.onrender.com), and optionally `ANTHROPIC_API_KEY`.
   - `probe-web`: `VITE_API_URL` = the backend URL (e.g. https://probe-api.onrender.com). Vite bakes this in at build time, so the frontend must be rebuilt after changing it.

## API
| Method | Path | Purpose |
|---|---|---|
| POST | /api/scan | Body `{"repo_url": "..."}` or `{"demo": true}`. Returns `{"id"}` |
| GET | /api/jobs/{id} | Stage progress, logs and, when done, the report |
| GET | /api/health | Health check |

## Safety notes
Scans run as an unprivileged user with CPU, memory and file-size limits, a stripped environment and per-test timeouts.
Render has no Docker-in-Docker, so there is no network or per-scan filesystem isolation: only scan code you trust, or move
execution to an isolated runner (E2B, Modal, gVisor) before making it public. Add rate limiting before exposing an API key publicly.
