import datetime
from fastapi import APIRouter, HTTPException
from app.api.schemas.repository import ExecuteTestRequest, ExecutionResultOut
from app.sandbox.execution_limits import execute_pytest_sandbox
from app.utils.logger import get_logger

log = get_logger(__name__)
router = APIRouter(prefix="/execute", tags=["execution"])

# In-memory storage for reports (resets when server restarts)
REPORTS_DB = []

@router.post("/test", response_model=ExecutionResultOut)
async def execute_test(req: ExecuteTestRequest):
    if not req.test_code.strip():
        raise HTTPException(400, "Test code cannot be empty")
        
    log.info("Starting test execution in sandbox...")
    result = execute_pytest_sandbox(req.test_code)
    duration = result.report.get("duration", 0.0) if result.report else 0.0
    
    # Save to in-memory DB
    report_data = {
        "id": datetime.datetime.now().strftime("%Y%m%d_%H%M%S"),
        "timestamp": datetime.datetime.now().isoformat(),
        "passed": result.passed,
        "duration": duration,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "test_code": req.test_code
    }
    
    REPORTS_DB.insert(0, report_data) # Add to the beginning of the list
    if len(REPORTS_DB) > 50: # Keep only the last 50
        REPORTS_DB.pop()

    return ExecutionResultOut(
        passed=result.passed,
        stdout=result.stdout,
        stderr=result.stderr,
        duration=duration
    )