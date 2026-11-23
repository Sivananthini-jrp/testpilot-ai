import ast
from dataclasses import asdict, dataclass, field
from pathlib import Path

from app.analyzers.code_parser import read_source
from app.core.file_filter import is_python_file
from app.utils.logger import get_logger

log = get_logger(__name__)


@dataclass
class FunctionInfo:
    name: str
    file: str
    lineno: int
    end_lineno: int
    args: list[str]
    decorators: list[str]
    is_async: bool
    complexity: int = 1


@dataclass
class ClassInfo:
    name: str
    file: str
    lineno: int
    end_lineno: int
    methods: list[str]
    bases: list[str]


@dataclass
class FileAnalysis:
    file: str
    lines: int = 0
    functions: list[FunctionInfo] = field(default_factory=list)
    classes: list[ClassInfo] = field(default_factory=list)
    imports: list[str] = field(default_factory=list)
    syntax_error: str | None = None


def _cyclomatic_complexity(node: ast.AST) -> int:
    complexity = 1
    for child in ast.walk(node):
        if isinstance(
            child,
            (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.With, ast.Assert),
        ):
            complexity += 1
        elif isinstance(child, ast.BoolOp):
            complexity += len(child.values) - 1
    return complexity


def _dotted_name(node: ast.AST) -> str:
    try:
        return ast.unparse(node)
    except Exception:
        return "<?>"


def analyze_python_file(path: Path, repo_root: Path) -> FileAnalysis:
    rel = str(path.relative_to(repo_root)).replace("\\", "/")
    source = read_source(path)
    if not source.strip():
        return FileAnalysis(file=rel)

    try:
        tree = ast.parse(source, filename=rel)
    except SyntaxError as e:
        log.warning("Syntax error in %s: %s", rel, e)
        return FileAnalysis(file=rel, lines=source.count("\n") + 1, syntax_error=str(e))

    analysis = FileAnalysis(file=rel, lines=source.count("\n") + 1)

    # Top-level imports only — deeper imports are picked up per-function later
    for node in tree.body:
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            analysis.imports.append(_dotted_name(node))

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            analysis.functions.append(
                FunctionInfo(
                    name=node.name,
                    file=rel,
                    lineno=node.lineno,
                    end_lineno=getattr(node, "end_lineno", node.lineno) or node.lineno,
                    args=[a.arg for a in node.args.args],
                    decorators=[_dotted_name(d) for d in node.decorator_list],
                    is_async=isinstance(node, ast.AsyncFunctionDef),
                    complexity=_cyclomatic_complexity(node),
                )
            )
        elif isinstance(node, ast.ClassDef):
            methods = [
                n.name
                for n in node.body
                if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))
            ]
            analysis.classes.append(
                ClassInfo(
                    name=node.name,
                    file=rel,
                    lineno=node.lineno,
                    end_lineno=getattr(node, "end_lineno", node.lineno) or node.lineno,
                    methods=methods,
                    bases=[_dotted_name(b) for b in node.bases],
                )
            )

    return analysis


def analyze_repository(repo_root: Path) -> dict:
    """
    Walk the repo, parse every Python file, and return aggregated metrics.
    The result is JSON-serializable and matches the API response schema.
    """
    python_files = sorted(
        p for p in repo_root.rglob("*.py") if p.is_file() and is_python_file(p)
    )

    file_analyses = [analyze_python_file(p, repo_root) for p in python_files]

    all_functions = [fn for fa in file_analyses for fn in fa.functions]
    all_classes = [cls for fa in file_analyses for cls in fa.classes]
    total_lines = sum(fa.lines for fa in file_analyses)
    syntax_errors = [fa for fa in file_analyses if fa.syntax_error]

    high_complexity = sorted(
        (fn for fn in all_functions if fn.complexity >= 10),
        key=lambda f: f.complexity,
        reverse=True,
    )

    return {
        "python_files": len(file_analyses),
        "total_functions": len(all_functions),
        "total_classes": len(all_classes),
        "total_lines": total_lines,
        "syntax_errors": len(syntax_errors),
        "files": [asdict(fa) for fa in file_analyses],
        "high_complexity_functions": [asdict(fn) for fn in high_complexity[:50]],
    }