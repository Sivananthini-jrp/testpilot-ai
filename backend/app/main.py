import logging
from app.api.routes.evaluation import router as evaluation_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.test_execution import router as execution_router
from app.config import settings
from app.api.routes.repositories import router as repositories_router
from app.api.routes.test_generation import router as generation_router
from app.api.routes.dashboard import router as dashboard_router
logging.basicConfig(level=settings.log_level)
logger = logging.getLogger("testpilot")

app = FastAPI(title="TestPilot AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(evaluation_router)
app.include_router(repositories_router)
app.include_router(generation_router)
app.include_router(execution_router)
app.include_router(dashboard_router)
@app.get("/health")
def health():
    return {"status": "ok", "service": "testpilot-ai"}