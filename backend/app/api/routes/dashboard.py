import json
from fastapi import APIRouter
from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)
router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/reports")
async def get_reports():
    report_dir = settings.upload_dir.parent / "reports"
    if not report_dir.exists():
        return []
        
    reports = []
    # Read the 20 most recent reports
    for file in sorted(report_dir.glob("*.json"), reverse=True)[:20]:
        try:
            reports.append(json.loads(file.read_text(encoding="utf-8")))
        except Exception as e:
            log.error(f"Failed to read report {file}: {e}")
            
    return reports