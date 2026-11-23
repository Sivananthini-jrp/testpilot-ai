import json
import datetime
from fastapi import APIRouter, HTTPException
from app.api.schemas.repository import ExecuteTestRequest, ExecutionResultOut
from app.sandbox.execution_limits import execute_pytest_sandbox
from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)
router = APIRouter(prefix="/execute", tags=["execution"])

@router.post("/test", response_model=ExecutionResultOut)
async def execute_test(req: ExecuteTestRequest):
    if not req.test_code.strip():
        raise HTTPException(400, "Test code cannot be empty")
        
    log.info("Starting test execution in sandbox...")
    result = execute_pytest_sandbox(req.test_code)
    duration = result.report.get("duration", 0.0) if result.report else 0.0
    
    # Save to storage/reports/
    report_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_data = {
        "id": report_id,
        "timestamp": datetime.datetime.now().isoformat(),
        "passed": result.passed,
        "duration": duration,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "test_code": req.test_code
    }
    
    report_dir = settings.upload_dir.parent / "reports"
    report_dir.mkdir(parents=True, exist_ok=True)
    report_file = report_dir / f"{report_id}.json"
    report_file.write_text(json.dumps(report_data, indent=2), encoding="utf-8")

    return ExecutionResultOut(
        passed=result.passed,
        stdout=result.stdout,
        stderr=result.stderr,
        duration=duration
    )