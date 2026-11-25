"""Autonomous testing agent: clone -> understand -> generate -> execute -> mutate -> report."""
from __future__ import annotations

import ast
import json
import os
import random
import re
import shutil
import subprocess
import sys
import tempfile
import time
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parent.parent
API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5")
MUTANTS = int(os.getenv("MUTANTS", "6"))
MAX_FILES = 25
SKIP_DIRS = {".git", "venv", ".venv", "node_modules", "tests", "test", "__pycache__", "build", "dist", "docs", "migrations", "site-packages"}
DANGER = ("os.remove", "shutil.rmtree", "subprocess", "os.system", "socket.", "requests.", "urllib", "input(", "sys.exit", "exec(", "eval(", "__import__", "os.kill")
STAGES = [("clone", "Fetch repository"), ("understand", "Understand the code"), ("generate", "Generate tests"),
          ("execute", "Run in sandbox"), ("mutate", "Mutation testing"), ("report", "Write evidence report")]


# ---------------------------------------------------------------- job plumbing
def new_job(repo_url, demo):
    return {"id": uuid.uuid4().hex[:10], "repo": "demo: buggy_shop" if demo else (repo_url or "").strip(), "demo": demo,
            "status": "queued", "created": time.time(), "mode": "llm" if API_KEY else "heuristic",
            "stages": [{"key": k, "label": l, "state": "pending", "detail": ""} for k, l in STAGES],
            "logs": [], "result": None, "error": None}


class Ctx:
    def __init__(self, job):
        self.job = job
        self.work = Path(tempfile.mkdtemp(prefix="probe_"))
        self.repo, self.tests = self.work / "repo", self.work / "tests"
        self.funcs, self.modules, self.results, self.cov, self.mut = [], [], [], None, None

    def log(self, msg):
        self.job["logs"].append(f"{time.strftime('%H:%M:%S')}  {msg}")

    def stage(self, key, state, detail=None):
        for s in self.job["stages"]:
            if s["key"] == key:
                s["state"] = state
                if detail is not None:
                    s["detail"] = detail


# ---------------------------------------------------------------- LLM helper
def llm(prompt, max_tokens=3500):
    if not API_KEY:
        return None
    try:
        r = httpx.post("https://api.anthropic.com/v1/messages", timeout=90,
                       headers={"x-api-key": API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                       json={"model": MODEL, "max_tokens": max_tokens, "system": "You are a meticulous senior QA engineer.",
                             "messages": [{"role": "user", "content": prompt}]})
        r.raise_for_status()
        return "".join(b.get("text", "") for b in r.json()["content"])
    except Exception:
        return None


def strip_fences(t):
    return re.sub(r"^```(?:python)?\s*\n|```\s*$", "", t.strip())


# ---------------------------------------------------------------- 1. clone
def n_clone(ctx):
    ctx.stage("clone", "running")
    if ctx.job["demo"]:
        shutil.copytree(ROOT / "samples" / "buggy_shop", ctx.repo)
    else:
        url = ctx.job["repo"]
        if not re.fullmatch(r"https://github\.com/[\w.-]+/[\w.-]+?(\.git)?/?", url):
            raise ValueError("Only public URLs like https://github.com/owner/repo are supported.")
        r = subprocess.run(["git", "clone", "--depth", "1", url, str(ctx.repo)], capture_output=True, text=True, timeout=90,
                           env={**os.environ, "GIT_TERMINAL_PROMPT": "0"})
        if r.returncode:
            raise RuntimeError("Could not clone the repository (is it public?): " + r.stderr[-200:])
    n = sum(1 for _ in ctx.repo.rglob("*.py"))
    ctx.log(f"Cloned {ctx.job['repo']} ({n} Python files)")
    ctx.stage("clone", "done", f"{n} Python files")


# ---------------------------------------------------------------- 2. understand (AST)
def _raise_names(fn):
    out = set()
    for r in ast.walk(fn):
        if isinstance(r, ast.Raise) and r.exc is not None:
            e = r.exc.func if isinstance(r.exc, ast.Call) else r.exc
            if isinstance(e, ast.Name):
                out.add(e.id)
    return out


def analyze(repo: Path):
    mods, funcs = [], []
    files = [p for p in sorted(repo.rglob("*.py"))
             if not (set(p.relative_to(repo).parts[:-1]) & SKIP_DIRS)
             and not p.name.startswith("test_") and not p.name.endswith("_test.py")
             and p.name not in ("setup.py", "conftest.py") and p.stat().st_size < 200_000]
    for p in files[:MAX_FILES]:
        src = p.read_text(errors="ignore")
        try:
            tree = ast.parse(src)
        except SyntaxError:
            continue
        parts = list(p.relative_to(repo).with_suffix("").parts)
        if parts[-1] == "__init__":
            parts = parts[:-1]
        if not parts:
            continue
        dotted, imports = ".".join(parts), set()
        for n in ast.walk(tree):
            if isinstance(n, ast.Import):
                imports.update(a.name for a in n.names)
            elif isinstance(n, ast.ImportFrom):
                if n.level:
                    base = parts[:-1] if p.name != "__init__.py" else parts
                    base = base[:len(base) - (n.level - 1)]
                    mod = ".".join(base + ([n.module] if n.module else []))
                else:
                    mod = n.module or ""
                imports.add(mod)
                imports.update(f"{mod}.{a.name}" for a in n.names)
        m = {"module": dotted, "file": p.relative_to(repo).as_posix(), "imports": imports, "functions": 0}
        for n in tree.body:
            if not isinstance(n, ast.FunctionDef):
                continue
            a, pos = n.args, n.args.posonlyargs + n.args.args
            nd = len(a.defaults)
            args = [{"name": x.arg, "ann": ast.unparse(x.annotation) if x.annotation else "", "default": i >= len(pos) - nd}
                    for i, x in enumerate(pos)]
            fsrc = ast.get_source_segment(src, n) or ""
            required = [x for x in args if not x["default"]]
            kw_required = any(d is None for d in a.kw_defaults)
            testable = (not n.name.startswith("_") and not n.decorator_list and not kw_required and len(required) <= 6
                        and not any(d in fsrc for d in DANGER))
            funcs.append({"module": dotted, "file": m["file"], "name": n.name, "args": args, "doc": ast.get_docstring(n) or "",
                          "source": fsrc, "lineno": n.lineno, "end": n.end_lineno,
                          "complexity": 1 + sum(isinstance(x, (ast.If, ast.For, ast.While, ast.Try, ast.BoolOp)) for x in ast.walk(n)),
                          "raises": sorted(_raise_names(n)), "testable": testable})
            m["functions"] += 1
        mods.append(m)
    names = {m["module"] for m in mods}
    for m in mods:
        m["deps"] = sorted(i for i in m.pop("imports") if i in names and i != m["module"])
    return mods, funcs


def n_understand(ctx):
    ctx.stage("understand", "running")
    ctx.modules, ctx.funcs = analyze(ctx.repo)
    t = sum(f["testable"] for f in ctx.funcs)
    if not t:
        raise ValueError("No testable Python functions found in this repository.")
    ctx.log(f"AST analysis: {len(ctx.funcs)} functions, {t} safe to test, {sum(len(m['deps']) for m in ctx.modules)} module dependencies")
    ctx.stage("understand", "done", f"{len(ctx.funcs)} functions in {len(ctx.modules)} modules")


# ---------------------------------------------------------------- 3. test generation
HEADER = '''import importlib, os, sys, pytest
from hypothesis import given, settings, strategies as st
sys.path.insert(0, os.environ.get("REPO_PATH", "."))
MOD = importlib.import_module("{module}")
def _fn(name): return getattr(MOD, name)
'''
PRIM = {"int": ["0", "-1", "1", "2**31"], "float": ["0.0", "-1.0", "1e308", "float('inf')"],
        "str": ["''", "' '", "'a'*2000", "'ünï\\n'"], "bool": ["True", "False"], "bytes": ["b''"],
        "list": ["[]", "[None]", "[0]*5"], "dict": ["{}"], "tuple": ["()"], "set": ["set()"]}
UNTYPED = ["0", "-1", "''", "None", "[]"]
STRAT = {"int": "st.integers()", "float": "st.floats()", "str": "st.text()", "bool": "st.booleans()"}


def _body(name, allowed):
    return ("    try:\n        fn(*args)\n    except Exception as e:\n"
            f"        if type(e).__name__ in {allowed}:\n            return\n"
            f"        raise AssertionError(f\"{name}{{args!r}} raised {{type(e).__name__}}: {{e}}\") from e\n")


def heuristic_tests(mod, fs):
    out = [HEADER.replace("{module}", mod["module"])]
    for f in fs:
        req = [a for a in f["args"] if not a["default"]]
        cs = [PRIM.get(a["ann"].split("[")[0].strip().lower(), UNTYPED) if a["ann"] else UNTYPED for a in req]
        n = max([len(c) for c in cs] or [1])
        rows = []
        for i in range(n + 3):
            row = "(" + ", ".join(c[(i * (k + 1)) % len(c)] for k, c in enumerate(cs)) + ("," if len(cs) == 1 else "") + ")"
            if row not in rows:
                rows.append(row)
        body = _body(f["name"], repr(set(f["raises"])))
        out.append(f"@pytest.mark.parametrize('args', [{', '.join(rows)}])\n"
                   f"def test_{f['name']}_edge_inputs(args):\n    fn = _fn('{f['name']}')\n" + body)
        if req and all(a["ann"] in STRAT for a in req):
            names = [f"a{i}" for i in range(len(req))]
            out.append(f"@settings(max_examples=60, deadline=500)\n@given({', '.join(STRAT[a['ann']] for a in req)})\n"
                       f"def test_{f['name']}_property({', '.join(names)}):\n"
                       f"    args = ({', '.join(names)}{',' if len(names) == 1 else ''})\n    fn = _fn('{f['name']}')\n" + body)
    return "\n".join(out)


def llm_tests(mod, src):
    out = llm(f"""Write a pytest file for this Python module. Import it with importlib.import_module("{mod['module']}") (the repo root is already on sys.path).
Cover normal cases, edge cases and error handling, and add Hypothesis property tests where useful. Only assert behaviour the code clearly intends
(from names, docstrings, types); never assert buggy behaviour. No network; write files only under tmp_path. At most 25 tests.
Return only Python code, no markdown.

```python
{src[:12000]}
```""")
    if not out:
        return None
    code = strip_fences(out)
    try:
        ast.parse(code)
    except SyntaxError:
        return None
    return code


def n_generate(ctx):
    ctx.stage("generate", "running")
    ctx.tests.mkdir()
    by_mod = {}
    for f in ctx.funcs:
        if f["testable"]:
            by_mod.setdefault(f["module"], []).append(f)
    total, picked = 0, sorted(by_mod.items(), key=lambda kv: -len(kv[1]))[:8]
    for i, (m, fs) in enumerate(picked):
        mod = next(x for x in ctx.modules if x["module"] == m)
        code = llm_tests(mod, (ctx.repo / mod["file"]).read_text(errors="ignore")) if API_KEY else None
        how = "LLM" if code else "heuristic"
        code = code or heuristic_tests(mod, fs)
        safe = re.sub(r"\W", "_", m)
        (ctx.tests / f"test_{i}_{safe}.py").write_text(code, encoding="utf-8")
        total += code.count("def test_")
        ctx.log(f"Generated tests for {m} ({how})")
    ctx.stage("generate", "done", f"{total} test functions in {len(picked)} files")


# ---------------------------------------------------------------- 4. sandboxed execution
def _limits():
    import resource
    resource.setrlimit(resource.RLIMIT_CPU, (120, 120))
    resource.setrlimit(resource.RLIMIT_AS, (2 << 30, 2 << 30))
    resource.setrlimit(resource.RLIMIT_FSIZE, (50 << 20, 50 << 20))
    os.setsid()


def _env(ctx, repo):
    return {"PATH": os.environ.get("PATH", ""), "HOME": str(ctx.work), "TMPDIR": str(ctx.work), "PYTHONPATH": str(repo),
            "REPO_PATH": str(repo), "PYTHONDONTWRITEBYTECODE": "1", "COVERAGE_FILE": str(ctx.work / ".coverage")}


def parse_junit(path: Path):
    res = []
    if not path.exists():
        return res
    for tc in ET.parse(path).iter("testcase"):
        bad = tc.find("failure") if tc.find("failure") is not None else tc.find("error")
        res.append({"id": f"{tc.get('classname')}::{tc.get('name')}",
                    "status": "fail" if bad is not None else "skip" if tc.find("skipped") is not None else "pass",
                    "message": (bad.get("message") or "") if bad is not None else "", "text": (bad.text or "") if bad is not None else ""})
    return res


def run_pytest(ctx, repo, xml, cov=False, timeout=150):
    if xml.exists():
        xml.unlink()
    cmd = [sys.executable, "-m"] + (["coverage", "run", "--branch", f"--source={repo}", "-m"] if cov else []) + \
          ["pytest", str(ctx.tests), "-q", "--no-header", "--timeout=10", "-p", "no:cacheprovider", f"--junitxml={xml}", f"--rootdir={ctx.tests}"]
    try:
        p = subprocess.run(cmd, cwd=repo, env=_env(ctx, repo), capture_output=True, text=True, timeout=timeout,
                           preexec_fn=_limits if os.name == "posix" else None)
        return {"tests": parse_junit(xml), "timeout": False, "out": p.stdout[-1500:] + p.stderr[-500:]}
    except subprocess.TimeoutExpired:
        return {"tests": [], "timeout": True, "out": "timed out"}


def coverage_json(ctx):
    out = ctx.work / "cov.json"
    subprocess.run([sys.executable, "-m", "coverage", "json", "-q", "-o", str(out)], cwd=ctx.repo, env=_env(ctx, ctx.repo),
                   capture_output=True, timeout=30)
    if not out.exists():
        return None
    d, files = json.loads(out.read_text()), {}
    for k, v in d["files"].items():
        p = Path(k) if Path(k).is_absolute() else ctx.repo / k
        try:
            files[p.resolve().relative_to(ctx.repo.resolve()).as_posix()] = round(v["summary"]["percent_covered"], 1)
        except ValueError:
            pass
    return {"total": round(d["totals"]["percent_covered"], 1), "files": files}


def n_execute(ctx):
    ctx.stage("execute", "running")
    res = run_pytest(ctx, ctx.repo, ctx.work / "base.xml", cov=True)
    if res["timeout"]:
        raise RuntimeError("The test run exceeded the 150 second limit.")
    ctx.results = res["tests"]
    if not ctx.results:
        raise RuntimeError("The test run produced no results: " + res["out"][-300:])
    ctx.cov = coverage_json(ctx)
    p = sum(r["status"] == "pass" for r in ctx.results)
    f = sum(r["status"] == "fail" for r in ctx.results)
    ctx.log(f"Sandbox run: {p} passed, {f} failed" + (f", coverage {ctx.cov['total']}%" if ctx.cov else ""))
    ctx.stage("execute", "done", f"{p} passed, {f} failed")


# ---------------------------------------------------------------- 5. mutation testing
OPS = {ast.Eq: ast.NotEq, ast.NotEq: ast.Eq, ast.Lt: ast.GtE, ast.Gt: ast.LtE, ast.LtE: ast.Gt, ast.GtE: ast.Lt,
       ast.Add: ast.Sub, ast.Sub: ast.Add, ast.Mult: ast.Add, ast.And: ast.Or, ast.Or: ast.And}


class Mutator(ast.NodeTransformer):
    def __init__(self, target):
        self.target, self.i, self.line = target, -1, None

    def _hit(self, node):
        self.i += 1
        if self.i == self.target:
            self.line = node.lineno
            return True
        return False

    def visit_Compare(self, n):
        self.generic_visit(n)
        for k, op in enumerate(n.ops):
            if type(op) in OPS and self._hit(n):
                n.ops[k] = OPS[type(op)]()
        return n

    def visit_BinOp(self, n):
        self.generic_visit(n)
        if type(n.op) in OPS and self._hit(n):
            n.op = OPS[type(n.op)]()
        return n

    visit_BoolOp = visit_BinOp


def n_mutate(ctx):
    ctx.stage("mutate", "running")
    cand = []
    for m in ctx.modules:
        mu = Mutator(-1)
        mu.visit(ast.parse((ctx.repo / m["file"]).read_text(errors="ignore")))
        cand += [(m["file"], k) for k in range(mu.i + 1)]
    random.Random(7).shuffle(cand)
    picks = cand[:MUTANTS]
    if not picks:
        ctx.stage("mutate", "done", "nothing to mutate")
        return
    mutrepo = ctx.work / "mut"
    shutil.copytree(ctx.repo, mutrepo, ignore=shutil.ignore_patterns(".git"))
    base_fail = {r["id"] for r in ctx.results if r["status"] == "fail"}
    killed, survivors = 0, []
    for f, k in picks:
        orig = (ctx.repo / f).read_text(errors="ignore")
        mu = Mutator(k)
        tree = mu.visit(ast.parse(orig))
        ast.fix_missing_locations(tree)
        (mutrepo / f).write_text(ast.unparse(tree))
        res = run_pytest(ctx, mutrepo, ctx.work / "mut.xml", timeout=40)
        (mutrepo / f).write_text(orig)
        failed = {r["id"] for r in res["tests"] if r["status"] == "fail"}
        if res["timeout"] or not res["tests"] or failed != base_fail:
            killed += 1
        else:
            survivors.append({"file": f, "line": mu.line})
    ctx.mut = {"total": len(picks), "killed": killed, "score": round(100 * killed / len(picks)), "survivors": survivors}
    ctx.log(f"Mutation testing: {killed}/{len(picks)} mutants caught")
    ctx.stage("mutate", "done", f"{killed}/{len(picks)} mutants caught")


# ---------------------------------------------------------------- 6. analysis + report
SEVERITY = {"ZeroDivisionError": "high", "IndexError": "high", "RecursionError": "high", "AssertionError": "high",
            "KeyError": "medium", "TypeError": "medium", "AttributeError": "medium", "ValueError": "low",
            "ModuleNotFoundError": "info", "ImportError": "info", "Failed": "medium"}
CATEGORY = {"ZeroDivisionError": "Unhandled edge case", "IndexError": "Unhandled edge case", "KeyError": "Unhandled edge case",
            "ValueError": "Input validation", "TypeError": "Type contract", "AttributeError": "Type contract",
            "AssertionError": "Logic error", "RecursionError": "Runaway recursion", "Failed": "Hang or timeout",
            "ModuleNotFoundError": "Environment", "ImportError": "Environment"}
CAUSE = {"ZeroDivisionError": "A division uses a value that can be zero (often from empty input). Guard the divisor or return a defined result for empty input.",
         "IndexError": "The code indexes into a sequence without checking that it has enough items. Check the length first.",
         "KeyError": "A dictionary lookup assumes the key exists. Use .get() with a default, or validate the key and raise a clear error.",
         "TypeError": "An operation receives a value of a type it does not support (for example None or a mixed list). Validate inputs at the function boundary.",
         "AttributeError": "The code calls a method or reads an attribute on a value that may be None or another type.",
         "AssertionError": "The output contradicts what the generated test expects. Review the logic against the function's docstring.",
         "ModuleNotFoundError": "A third-party dependency is missing in the sandbox, so the module cannot be imported. This is not a code bug."}


def exc_type(r):
    m = (re.search(r"raised (\w+):", r["message"]) or re.search(r"^E\s+(\w+(?:Error|Exception|Exit))", r["text"], re.M)
         or re.match(r"(\w+)", r["message"]))
    return m.group(1) if m else "Failure"


def locate(ctx, r):
    text = r["text"].split("The above exception was the direct cause")[0]
    for path, line in reversed(re.findall(r"^(\S+?\.py):(\d+):", text, re.M)):
        for base in (Path("."), ctx.tests, ctx.repo):
            p = Path(path) if Path(path).is_absolute() else base / path
            if not p.exists():
                continue
            p = p.resolve()
            if ctx.repo.resolve() in p.parents:
                rel = p.relative_to(ctx.repo.resolve()).as_posix()
                hit = next((f for f in ctx.funcs if f["file"] == rel and f["lineno"] <= int(line) <= f["end"]), None)
                return (hit or {"file": rel, "name": Path(rel).stem, "source": "", "lineno": int(line), "module": rel[:-3].replace("/", ".")}), int(line)
    return None, 0


def n_report(ctx):
    ctx.stage("report", "running")
    groups = {}
    for r in (x for x in ctx.results if x["status"] == "fail"):
        exc = exc_type(r)
        fn, line = locate(ctx, r)
        key = (fn["file"] if fn else "?", fn["name"] if fn else r["id"], exc)
        g = groups.setdefault(key, {"r": r, "fn": fn, "line": line, "exc": exc, "n": 0})
        g["n"] += 1
    order = ["high", "medium", "low", "info"]
    findings, rejected = [], 0
    for i, g in enumerate(sorted(groups.values(), key=lambda g: order.index(SEVERITY.get(g["exc"], "medium")))):
        r, fn, exc = g["r"], g["fn"], g["exc"]
        name = fn["name"] if fn else r["id"]
        verdict, cause, patch, conf = "code_bug", CAUSE.get(exc, "The function failed on an input the generated tests exercised. Inspect the evidence."), None, None
        if API_KEY and fn and fn.get("source") and i < 6:
            out = llm(f"""A generated test failed. Decide whether this is a real bug in the code or a flaw in the test.
Function ({fn['file']}:{fn['lineno']}):
```python
{fn['source'][:4000]}
```
Failure:
{r['message'][:600]}
{r['text'][-1200:]}
Reply with JSON only: {{"verdict":"code_bug" or "test_issue","root_cause":"2-3 sentences","patch":"the corrected function as Python code, or empty","confidence":0.0-1.0}}""", 1500)
            m = re.search(r"\{.*\}", out or "", re.S)
            try:
                d = json.loads(m.group(0)) if m else {}
                verdict, cause, patch, conf = d.get("verdict", verdict), d.get("root_cause", cause), d.get("patch") or None, d.get("confidence")
            except json.JSONDecodeError:
                pass
        if verdict == "test_issue":
            rejected += 1
            continue
        call = re.search(r"(\w+)(\([^\n]*\)) raised", r["message"])
        if call and fn and fn.get("module"):
            reg = (f"from {fn['module']} import {call.group(1)}\n\n\ndef test_regression_{call.group(1)}_{len(findings) + 1}():\n"
                   f"    # Reproduces {exc}. Passes once the bug is fixed.\n    {call.group(1)}{call.group(2).splitlines()[0]}\n")
        else:
            reg = f"# Failing generated test: {r['id']}\n# Keep it in your suite once the fix lands."
        findings.append({"id": f"BUG-{len(findings) + 1}", "title": f"{name}() fails with {exc}", "file": fn["file"] if fn else "unknown",
                         "function": name, "line": g["line"], "category": CATEGORY.get(exc, "Runtime error"),
                         "severity": SEVERITY.get(exc, "medium"), "occurrences": g["n"],
                         "error": r["message"].splitlines()[0][:300] if r["message"] else exc,
                         "evidence": r["text"].split("The above exception was the direct cause")[0][-1800:], "root_cause": cause, "patch": patch, "confidence": conf, "regression_test": reg})
    p = sum(r["status"] == "pass" for r in ctx.results)
    f = sum(r["status"] == "fail" for r in ctx.results)
    cov = ctx.cov["files"] if ctx.cov else {}
    ctx.job["result"] = {
        "summary": {"tests": len(ctx.results), "passed": p, "failed": f, "bugs": len(findings), "test_issues": rejected,
                    "functions": len(ctx.funcs), "coverage": ctx.cov["total"] if ctx.cov else None,
                    "mutation": ctx.mut["score"] if ctx.mut else None, "mode": ctx.job["mode"]},
        "findings": findings, "mutation": ctx.mut,
        "modules": [{"module": m["module"], "file": m["file"], "functions": m["functions"], "deps": m["deps"],
                     "coverage": cov.get(m["file"])} for m in ctx.modules]}
    ctx.log(f"Report ready: {len(findings)} bug candidates")
    ctx.stage("report", "done", f"{len(findings)} bug candidates")


NODES = [n_clone, n_understand, n_generate, n_execute, n_mutate, n_report]


def run_graph(ctx):
    """Run the agent as a LangGraph state machine (plain loop if langgraph is unavailable)."""
    try:
        from typing import TypedDict
        from langgraph.graph import END, START, StateGraph
    except ImportError:
        for fn in NODES:
            fn(ctx)
        return

    class State(TypedDict):
        ctx: object

    def wrap(fn):
        def node(state):
            fn(state["ctx"])
            return {"ctx": state["ctx"]}
        return node

    g, prev = StateGraph(State), START
    for fn in NODES:
        g.add_node(fn.__name__, wrap(fn))
        g.add_edge(prev, fn.__name__)
        prev = fn.__name__
    g.add_edge(prev, END)
    g.compile().invoke({"ctx": ctx})


def run_job(job):
    ctx = Ctx(job)
    job["status"] = "running"
    try:
        run_graph(ctx)
        job["status"] = "done"
    except Exception as e:  # noqa: BLE001
        job["status"], job["error"] = "error", str(e)
        for s in job["stages"]:
            if s["state"] == "running":
                s["state"] = "failed"
    finally:
        shutil.rmtree(ctx.work, ignore_errors=True)
