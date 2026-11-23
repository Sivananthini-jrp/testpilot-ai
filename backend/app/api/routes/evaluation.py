from fastapi import APIRouter, HTTPException
from app.api.schemas.repository import MutationEvaluationRequest, MutationResultOut
from app.sandbox.execution_limits import execute_mutation_sandbox
from app.utils.logger import get_logger

log = get_logger(__name__)
router = APIRouter(prefix="/evaluate", tags=["evaluation"])

@router.post("/mutation", response_model=MutationResultOut)
async def evaluate_mutation(req: MutationEvaluationRequest):
    if not req.source_code or not req.test_code:
        raise HTTPException(400, "Both source code and test code are required")

    log.info("Starting mutation testing...")
    result = execute_mutation_sandbox(req.source_code, req.test_code)
    
    return MutationResultOut(
        score=result.score,
        killed=result.killed,
        survived=result.survived,
        total=result.total
    )