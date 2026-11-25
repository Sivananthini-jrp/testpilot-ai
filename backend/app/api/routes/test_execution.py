import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.api.schemas.repository import ExecuteTestRequest, ExecutionResultOut
from app.sandbox.execution_limits import execute_pytest_sandbox
from app.utils.logger import get_logger

log = get_logger(__name__)
router = APIRouter(prefix="/execute", tags=["execution"])

@router.post("/test", response_model=ExecutionResultOut)
async def execute_test(req: ExecuteTestRequest, db: Session = Depends(get_db)):
    print(f"🔥 EXECUTING TEST for repo: {req.repo_id}, function: {req.function_name}")
    
    if not req.test_code.strip():
        raise HTTPException(400, "Test code cannot be empty")
        
    # 1. Run the test in the sandbox
    result = execute_pytest_sandbox(req.test_code, req.source_code)
    duration = result.report.get("duration", 0.0) if result.report else 0.0
    
    # 2. Save the result to Neon DB
    if req.repo_id:
        try:
            report = models.TestReport(
                repo_id=req.repo_id,
                function_name=req.function_name,
                passed=result.passed,
                stdout=result.stdout,
                stderr=result.stderr,
                duration=str(duration)
            )
            db.add(report)
            db.commit()
            print("✅ SAVED TO NEON DATABASE")
        except Exception as e:
            print(f"❌ DATABASE ERROR: {e}")
            db.rollback()
    else:
        print("⚠️ SKIPPED SAVE: repo_id was missing from the request!")

    return ExecutionResultOut(
        passed=result.passed,
        stdout=result.stdout,
        stderr=result.stderr,
        duration=duration
    )