import ast
import subprocess
import sys
import tempfile
from pathlib import Path
from app.utils.logger import get_logger

log = get_logger(__name__)

class SingleMutationTransformer(ast.NodeTransformer):
    def __init__(self):
        self.mutated = False

    def visit_BinOp(self, node):
        if not self.mutated and isinstance(node.op, (ast.Add, ast.Sub, ast.Mult)):
            self.mutated = True
            if isinstance(node.op, ast.Add): node.op = ast.Sub()
            elif isinstance(node.op, ast.Sub): node.op = ast.Add()
            elif isinstance(node.op, ast.Mult): node.op = ast.Div()
        return self.generic_visit(node)

    def visit_Compare(self, node):
        if not self.mutated and isinstance(node.ops[0], (ast.Eq, ast.NotEq, ast.Gt, ast.Lt)):
            self.mutated = True
            if isinstance(node.ops[0], ast.Eq): node.ops[0] = ast.NotEq()
            elif isinstance(node.ops[0], ast.NotEq): node.ops[0] = ast.Eq()
            elif isinstance(node.ops[0], ast.Gt): node.ops[0] = ast.Lt()
            elif isinstance(node.ops[0], ast.Lt): node.ops[0] = ast.Gt()
        return self.generic_visit(node)


def run_mutation_testing(source_code: str, test_code: str) -> dict:
    try:
        ast.parse(test_code)
    except SyntaxError:
        return {"score": 0.0, "killed": 0, "survived": 0, "total": 0, "error": "Test code has syntax errors."}

    try:
        tree = ast.parse(source_code)
    except SyntaxError:
        return {"score": 0.0, "killed": 0, "survived": 0, "total": 0, "error": "Source code has syntax errors."}

    tester = SingleMutationTransformer()
    tester.visit(tree)
    if not tester.mutated:
        return {"score": 0.0, "killed": 0, "survived": 0, "total": 0, "error": "No mutable operators found in source."}

    total_mutants = 1 
    combined_code = source_code + "\n\n" + test_code
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        test_file = temp_path / "combined_test.py"
        
        test_file.write_text(combined_code, encoding="utf-8")
        
        try:
            base_result = subprocess.run(
                [sys.executable, "-m", "pytest", str(test_file), "-q"],
                capture_output=True, text=True, cwd=temp_dir, timeout=10
            )
        except subprocess.TimeoutExpired:
            return {"score": 0.0, "killed": 0, "survived": 0, "total": 0, "error": "Original test timed out."}
        
        if base_result.returncode != 0:
            log.warning("Original test failed. Cannot run mutation testing.")
            # FIX: Return 0 total instead of 1 survived
            return {"score": 0.0, "killed": 0, "survived": 0, "total": 0, "error": "Original test failed."}

        mutant_tree = ast.parse(source_code)
        mutator = SingleMutationTransformer()
        mutant_tree = mutator.visit(mutant_tree)
        
        mutated_source = ast.unparse(mutant_tree)
        mutant_code = mutated_source + "\n\n" + test_code
        test_file.write_text(mutant_code, encoding="utf-8")
        
        try:
            mutant_result = subprocess.run(
                [sys.executable, "-m", "pytest", str(test_file), "-q"],
                capture_output=True, text=True, cwd=temp_dir, timeout=10
            )
        except subprocess.TimeoutExpired:
            return {"score": 0.0, "killed": 0, "survived": 0, "total": 0, "error": "Mutant test timed out."}
        
        killed = 1 if mutant_result.returncode != 0 else 0
        survived = total_mutants - killed
        score = (killed / total_mutants) * 100
        
        return {
            "score": score,
            "killed": killed,
            "survived": survived,
            "total": total_mutants,
            "error": None
        }