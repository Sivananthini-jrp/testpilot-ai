from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    total = db.query(models.TestReport).count()
    passed = db.query(models.TestReport).filter(models.TestReport.passed == True).count()
    return {"total": total, "passed": passed, "failed": total - passed}

@router.get("/reports")
async def get_reports(db: Session = Depends(get_db)):
    reports = db.query(models.TestReport).order_by(models.TestReport.created_at.desc()).limit(50).all()
    return [{"id": r.id, "repo_id": r.repo_id, "function_name": r.function_name, "passed": r.passed, "stdout": r.stdout, "stderr": r.stderr, "timestamp": r.created_at.isoformat()} for r in reports]