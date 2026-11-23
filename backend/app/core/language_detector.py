from collections import Counter
from pathlib import Path

from app.core.file_filter import LANGUAGE_BY_EXTENSION, is_excluded


def detect_languages(repo_root: Path) -> dict[str, int]:
    """
    Return a {language: file_count} map by scanning file extensions.
    Excludes dependency/build directories so counts reflect actual project code.
    """
    counts: Counter[str] = Counter()

    for path in repo_root.rglob("*"):
        if not path.is_file():
            continue
        if is_excluded(path):
            continue

        lang = LANGUAGE_BY_EXTENSION.get(path.suffix.lower())
        if lang:
            counts[lang] += 1

    return dict(counts.most_common())