import json
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from app.utils.logger import get_logger

log = get_logger(__name__)

@dataclass
class Finding:
    file: str
    line: int
    column: int
    code: str
    message: str
    severity: str  # "error", "warning", "info"
    tool: str      # "ruff" or "bandit"

def _get_relative_path(file_path: str, repo_dir: Path) -> str:
    """Safely get the relative path, handling absolute vs relative paths on Linux/Windows."""
    try:
        # Resolve both to absolute paths to ensure they match
        abs_file = Path(file_path).resolve()
        abs_repo = repo_dir.resolve()
        return str(abs_file.relative_to(abs_repo)).replace("\\", "/")
    except ValueError:
        # Fallback if the file is somehow outside the repo
        return file_path

def run_ruff(repo_dir: Path) -> list[Finding]:
    """Run Ruff and parse JSON output."""
    cmd = [sys.executable, "-m", "ruff", "check", str(repo_dir), "--output-format=json", "--exit-zero"]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        log.error(f"Ruff failed: {e}")
        return []

    findings = []
    for item in data:
        code = item.get("code", "")
        severity = "warning"
        if code.startswith("E") or code.startswith("F"):
            severity = "error"
            
        findings.append(Finding(
            file=_get_relative_path(item["filename"], repo_dir),
            line=item["location"]["row"],
            column=item["location"]["column"],
            code=code,
            message=item["message"],
            severity=severity,
            tool="ruff"
        ))
    return findings

def run_bandit(repo_dir: Path) -> list[Finding]:
    """Run Bandit and parse JSON output."""
    cmd = [sys.executable, "-m", "bandit", "-r", str(repo_dir), "-f", "json", "-q"]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        data = json.loads(result.stdout)
    except json.JSONDecodeError as e:
        log.error(f"Bandit failed to return JSON: {e}")
        return []

    findings = []
    for item in data.get("results", []):
        severity_map = {"HIGH": "error", "MEDIUM": "warning", "LOW": "info"}
        
        findings.append(Finding(
            file=_get_relative_path(item["filename"], repo_dir),
            line=item["line_number"],
            column=item["col_offset"],
            code=item["test_id"],
            message=item["issue_text"],
            severity=severity_map.get(item["issue_severity"], "warning"),
            tool="bandit"
        ))
    return findings

def analyze_static(repo_dir: Path) -> list[dict]:
    """Run all static tools and return a combined list of findings."""
    log.info(f"Running static analysis on {repo_dir}")
    ruff_findings = run_ruff(repo_dir)
    bandit_findings = run_bandit(repo_dir)
    
    all_findings = ruff_findings + bandit_findings
    return [
        {
            "file": f.file,
            "line": f.line,
            "column": f.column,
            "code": f.code,
            "message": f.message,
            "severity": f.severity,
            "tool": f.tool
        } for f in all_findings
    ]