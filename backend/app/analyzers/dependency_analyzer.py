import ast
from pathlib import Path
from app.analyzers.code_parser import read_source
from app.core.file_filter import is_python_file
from app.utils.logger import get_logger

log = get_logger(__name__)

def build_dependency_graph(repo_dir: Path) -> dict[str, list[str]]:
    """
    Returns a mapping of {file: [list_of_internal_files_it_imports]}.
    Only maps internal dependencies (files within the repo).
    """
    graph = {}
    
    # 1. Map module names to file paths (e.g., 'app.utils' -> 'app/utils.py')
    python_files = [p for p in repo_dir.rglob("*.py") if is_python_file(p)]
    
    module_map = {}
    for p in python_files:
        rel_path = p.relative_to(repo_dir)
        # Convert path to dotted module: app/utils.py -> app.utils
        parts = list(rel_path.with_suffix("").parts)
        if parts[-1] == "__init__":
            parts.pop()
        module_name = ".".join(parts)
        module_map[module_name] = str(rel_path).replace("\\", "/")

    # 2. Parse imports in each file
    for p in python_files:
        rel_path = str(p.relative_to(repo_dir)).replace("\\", "/")
        graph[rel_path] = []
        
        source = read_source(p)
        if not source:
            continue
            
        try:
            tree = ast.parse(source)
        except SyntaxError:
            continue

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name in module_map:
                        target = module_map[alias.name]
                        if target != rel_path: # Ignore self-imports
                            graph[rel_path].append(target)
                            
            elif isinstance(node, ast.ImportFrom):
                if node.module and node.module in module_map:
                    target = module_map[node.module]
                    if target != rel_path:
                        graph[rel_path].append(target)
                        
    # Deduplicate edges
    for k in graph:
        graph[k] = list(set(graph[k]))
        
    return graph