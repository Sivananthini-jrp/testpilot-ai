from fastapi import APIRouter, HTTPException
from app.api.schemas.repository import GenerateTestRequest, GeneratedTestOut
from app.services.llm_service import generate_test_code
from app.test_engine.test_validator import validate_python_syntax
from app.config import settings
from app.utils.logger import get_logger
import ast

log = get_logger(__name__)
router = APIRouter(prefix="/generate", tags=["generation"])

@router.post("/test", response_model=GeneratedTestOut)
async def generate_test(req: GenerateTestRequest):
    repo_dir = settings.upload_dir / req.repo_id / "source"
    file_path = repo_dir / req.file
    
    if not file_path.exists():
        raise HTTPException(404, "File not found in repository")
        
    source_code = file_path.read_text(encoding="utf-8")
    
    # 1. Extract ONLY the specific function using AST
    try:
        tree = ast.parse(source_code)
    except SyntaxError:
        raise HTTPException(400, "Could not parse source file")

    function_source = ""
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == req.function_name:
            function_source = ast.get_source_segment(source_code, node)
            break
            
    if not function_source:
        raise HTTPException(404, f"Function '{req.function_name}' not found in file")

    # 2. Ask LLM to generate test
    try:
        generated_code = await generate_test_code(function_source, "None")
    except Exception as e:
        log.error(f"LLM Generation failed: {e}")
        raise HTTPException(500, f"AI Generation failed: {str(e)}")
        
    # 3. Validate the generated code
    is_valid, error_msg = validate_python_syntax(generated_code)
    
    return GeneratedTestOut(
        function_name=req.function_name,
        file=req.file,
        code=generated_code,
        source_code=function_source, # <-- Add this
        is_valid=is_valid,
        error_message=error_msg
    )