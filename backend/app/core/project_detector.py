from pathlib import Path

# Manifest files mapped to a human-readable project type
MANIFESTS: dict[str, str] = {
    "pyproject.toml": "Python (pyproject)",
    "setup.py": "Python (setuptools)",
    "setup.cfg": "Python (setuptools)",
    "requirements.txt": "Python (pip)",
    "Pipfile": "Python (pipenv)",
    "poetry.lock": "Python (poetry)",
    "package.json": "Node.js",
    "yarn.lock": "Node.js (yarn)",
    "pnpm-lock.yaml": "Node.js (pnpm)",
    "go.mod": "Go",
    "Cargo.toml": "Rust",
    "pom.xml": "Java (Maven)",
    "build.gradle": "Java (Gradle)",
    "composer.json": "PHP",
    "Gemfile": "Ruby",
}


def detect_project_types(repo_root: Path) -> list[str]:
    """
    Return all detected project types based on manifest files in the repo root.
    Repos can be polyglot; we return every match.
    """
    detected: list[str] = []
    for name, label in MANIFESTS.items():
        if (repo_root / name).exists():
            detected.append(label)
    return detected or ["Unknown"]