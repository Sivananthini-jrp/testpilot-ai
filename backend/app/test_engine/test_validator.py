import ast
from app.utils.logger import get_logger

log = get_logger(__name__)

def validate_python_syntax(code: str) -> tuple[bool, str]:
    """
    Checks if the generated code is valid Python.
    Returns (is_valid, error_message).
    """
    try:
        ast.parse(code)
        return True, ""
    except SyntaxError as e:
        log.warning(f"Invalid test generated: {e}")
        return False, f"Syntax Error: {e.msg} at line {e.lineno}"