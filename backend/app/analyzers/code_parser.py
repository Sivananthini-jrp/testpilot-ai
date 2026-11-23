from pathlib import Path

from app.utils.logger import get_logger

log = get_logger(__name__)


def read_source(path: Path, max_bytes: int = 2_000_000) -> str:
    """
    Read a source file as text, capped at max_bytes to avoid giant-file blowups.
    Returns '' on any read error so a single bad file doesn't abort analysis.
    """
    try:
        if path.stat().st_size > max_bytes:
            log.warning("Skipping oversized file %s", path)
            return ""
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        log.warning("Failed to read %s: %s", path, e)
        return ""