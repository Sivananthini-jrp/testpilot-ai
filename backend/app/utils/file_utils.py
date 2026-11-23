import zipfile
from pathlib import Path

from app.utils.logger import get_logger

log = get_logger(__name__)


class UnsafeArchiveError(Exception):
    """Raised when a ZIP contains entries that would escape the target directory."""


def safe_extract_zip(zip_path: Path, target_dir: Path) -> int:
    """
    Extract a ZIP into target_dir, rejecting absolute paths and '..' traversal.
    Returns the number of files extracted.
    """
    target_dir = target_dir.resolve()
    target_dir.mkdir(parents=True, exist_ok=True)

    extracted = 0
    with zipfile.ZipFile(zip_path, "r") as zf:
        for member in zf.infolist():
            if member.is_dir():
                continue

            member_path = (target_dir / member.filename).resolve()

            # zip-slip guard: use Path.is_relative_to for OS-agnostic checking
            if not member_path.is_relative_to(target_dir):
                raise UnsafeArchiveError(f"Unsafe path in archive: {member.filename}")

            member_path.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(member) as src, open(member_path, "wb") as dst:
                dst.write(src.read())
            extracted += 1

    log.info("Extracted %d files into %s", extracted, target_dir)
    return extracted