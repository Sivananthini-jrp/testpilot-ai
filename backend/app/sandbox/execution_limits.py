import subprocess
import tempfile
import json
import sys
from pathlib import Path
from app.utils.logger import get_logger
from app.test_engine.mutation_analyzer import run_mutation_testing

log = get_logger(__name__)

class SandboxResult:
    def __init__(self, passed: bool, stdout: str, stderr: str, report: dict):
        self.passed = passed
        self.stdout = stdout
        self.stderr = stderr
        self.report = report

class MutationResult:
    def __init__(self, score: float, killed: int, survived: int, total: int):
        self.score = score
        self.killed = killed
        self.survived = survived
        self.total = total

def execute_pytest_sandbox(test_code: str, source_code: str = "", timeout_seconds: int = 10) -> SandboxResult:
    """
    Runs pytest. If source_code is provided, it writes it to a file so the test can import it.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        test_file = temp_path / "test_generated.py"
        report_file = temp_path / "report.json"
        
        test_file.write_text(test_code, encoding="utf-8")
        
        # If source code is provided, write it to module.py
        if source_code:
            source_file = temp_path / "module_under_test.py"
            source_file.write_text(source_code, encoding="utf-8")

        try:
            result = subprocess.run(
                [sys.executable, "-m", "pytest", str(test_file), "--json-report", f"--json-report-file={report_file}", "-q"],
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                cwd=temp_dir
            )
            stdout = result.stdout
            stderr = result.stderr
        except subprocess.TimeoutExpired:
            return SandboxResult(
                passed=False, stdout="", stderr="Execution timed out.", report={}
            )

        report_data = {}
        if report_file.exists():
            try:
                report_data = json.loads(report_file.read_text())
            except json.JSONDecodeError:
                pass

        passed = report_data.get("success", False)
        
        return SandboxResult(passed=passed, stdout=stdout, stderr=stderr, report=report_data)


def execute_mutation_sandbox(source_code: str, test_code: str, timeout_seconds: int = 30) -> MutationResult:
    """
    Runs custom AST mutation testing.
    """
    log.info("Running custom AST mutation testing...")
    try:
        result = run_mutation_testing(source_code, test_code)
        
        return MutationResult(
            score=result["score"],
            killed=result["killed"],
            survived=result["survived"],
            total=result["total"]
        )
    except Exception as e:
        log.error(f"Mutation sandbox error: {e}")
        return MutationResult(score=0.0, killed=0, survived=0, total=0)