import os
import threading
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .pipeline import new_job, run_job

app = FastAPI(title="Probe API")

# Comma-separated list of allowed frontend origins, e.g. "https://probe-web.onrender.com"
origins = [o.strip().rstrip("/") for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"], allow_headers=["*"])

JOBS: dict[str, dict] = {}
SLOTS = threading.Semaphore(int(os.getenv("MAX_JOBS", "2")))


class ScanRequest(BaseModel):
    repo_url: str | None = None
    demo: bool = False


def _worker(job: dict) -> None:
    with SLOTS:
        run_job(job)


@app.get("/")
def root():
    return {"service": "probe-api", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/scan")
def scan(req: ScanRequest):
    if not req.demo and not req.repo_url:
        raise HTTPException(400, "Enter a public GitHub repository URL or try the demo.")
    for k in [k for k, v in JOBS.items() if time.time() - v["created"] > 3600]:
        JOBS.pop(k, None)
    job = new_job(req.repo_url, req.demo)
    JOBS[job["id"]] = job
    threading.Thread(target=_worker, args=(job,), daemon=True).start()
    return {"id": job["id"]}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(404, "Scan not found. The server may have restarted; start a new scan.")
    return JOBS[job_id]
