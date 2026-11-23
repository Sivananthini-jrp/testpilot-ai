import shutil
import uuid
from pathlib import Path

from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)


def new_repo_id() -> str:
    return uuid.uuid4().hex[:12]


def repo_path(repo_id: str) -> Path:
    return settings.upload_dir / repo_id


def create_workspace(repo_id: str) -> Path:
    path = repo_path(repo_id)
    path.mkdir(parents=True, exist_ok=False)
    return path


def delete_workspace(repo_id: str) -> None:
    path = repo_path(repo_id)
    if path.exists():
        shutil.rmtree(path)
        log.info("Deleted workspace %s", path)