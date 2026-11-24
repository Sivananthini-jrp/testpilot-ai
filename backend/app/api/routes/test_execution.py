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
    if not req.test_code.strip():
        raise HTTPException(400, "Test code cannot be empty")
        
    log.info("Starting test execution in sandbox...")
    result = execute_pytest_sandbox(req.test_code)
    duration = result.report.get("duration", 0.0) if result.report else 0.0
    
    # Save to database if repo_id is provided
    if req.repo_id and req.function_name:
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

    return ExecutionResultOut(
        passed=result.passed,
        stdout=result.stdout,
        stderr=result.stderr,
        duration=duration
    )