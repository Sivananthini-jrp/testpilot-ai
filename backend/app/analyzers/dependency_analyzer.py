import ast
from pathlib import Path
from app.analyzers.code_parser import read_source
from app.core.file_filter import is_python_file
from app.utils.logger import get_logger

log = get_logger(__name__)

def build_dependency_graph(repo_dir: Path) -> dict[str, list[str]]:
    graph = {}
    python_files = [p for p in repo_dir.rglob("*.py") if is_python_file(p)]
    
    module_map = {}
    for p in python_files:
        rel_path = p.relative_to(repo_dir)
        parts = list(rel_path.with_suffix("").parts)
        if parts[-1] == "__init__":
            parts.pop()
        module_name = ".".join(parts)
        module_map[module_name] = str(rel_path).replace("\\", "/")

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
                        if target != rel_path:
                            graph[rel_path].append(target)
                            
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    for alias in node.names:
                        full_mod_name = f"{node.module}.{alias.name}"
                        if full_mod_name in module_map:
                            target = module_map[full_mod_name]
                            if target != rel_path:
                                graph[rel_path].append(target)
                        elif node.module in module_map:
                            target = module_map[node.module]
                            if target != rel_path:
                                graph[rel_path].append(target)
                elif node.level > 0:
                    # Handle relative imports
                    parts = rel_path.split("/")
                    if p.name == "__init__.py":
                        parts = parts[:-1]
                    for _ in range(node.level):
                        if parts: parts.pop()
                    
                    if node.module:
                        parts.extend(node.module.split("."))
                    
                    for alias in node.names:
                        full_mod_name = ".".join(parts + [alias.name])
                        if full_mod_name in module_map:
                            target = module_map[full_mod_name]
                            if target != rel_path:
                                graph[rel_path].append(target)
                    
                    if node.module:
                        full_mod_name = ".".join(parts)
                        if full_mod_name in module_map:
                            target = module_map[full_mod_name]
                            if target != rel_path:
                                graph[rel_path].append(target)
                        
    for k in graph:
        graph[k] = list(set(graph[k]))
        
    return graph