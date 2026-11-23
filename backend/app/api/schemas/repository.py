from pydantic import BaseModel


class FunctionInfoOut(BaseModel):
    name: str
    file: str
    lineno: int
    end_lineno: int
    args: list[str]
    decorators: list[str]
    is_async: bool
    complexity: int


class ClassInfoOut(BaseModel):
    name: str
    file: str
    lineno: int
    end_lineno: int
    methods: list[str]
    bases: list[str]


class FileAnalysisOut(BaseModel):
    file: str
    lines: int
    functions: list[FunctionInfoOut]
    classes: list[ClassInfoOut]
    imports: list[str]
    syntax_error: str | None = None


class RepositoryAnalysisOut(BaseModel):
    repo_id: str
    project_types: list[str]
    languages: dict[str, int]
    python_files: int
    total_functions: int
    total_classes: int
    total_lines: int
    syntax_errors: int
    files: list[FileAnalysisOut]
    high_complexity_functions: list[FunctionInfoOut]
    findings: list[FindingOut]
    dependencies: dict[str, list[str]]

class FindingOut(BaseModel):
    file: str
    line: int
    column: int
    code: str
    message: str
    severity: str
    tool: str

    # Add at the bottom of the file
class GenerateTestRequest(BaseModel):
    repo_id: str
    file: str
    function_name: str

class GeneratedTestOut(BaseModel):
    function_name: str
    file: str
    code: str
    source_code: str # <-- Add this
    is_valid: bool
    error_message: str = ""

# Add at the bottom of the file
class ExecuteTestRequest(BaseModel):
    test_code: str

class ExecutionResultOut(BaseModel):
    passed: bool
    stdout: str
    stderr: str
    duration: float = 0.0

class MutationEvaluationRequest(BaseModel):
    source_code: str
    test_code: str

class MutationResultOut(BaseModel):
    score: float
    killed: int
    survived: int
    total: int