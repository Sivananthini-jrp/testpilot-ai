import shutil
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.analyzers.ast_analyzer import analyze_repository
from app.analyzers.dependency_analyzer import build_dependency_graph
from app.analyzers.static_analyzer import analyze_static
from app.api.schemas.repository import RepositoryAnalysisOut, FindingOut
from app.config import settings
from app.core.language_detector import detect_languages
from app.core.project_detector import detect_project_types
from app.core.repository_manager import create_workspace, delete_workspace, new_repo_id
from app.utils.file_utils import UnsafeArchiveError, safe_extract_zip
from app.utils.logger import get_logger

log = get_logger(__name__)
router = APIRouter(prefix="/repositories", tags=["repositories"])


@router.post("/upload", response_model=RepositoryAnalysisOut)
async def upload_repository(file: UploadFile = File(...)) -> RepositoryAnalysisOut:
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(400, "Only .zip files are accepted")

    repo_id = new_repo_id()
    workspace = create_workspace(repo_id)
    zip_path = workspace / "upload.zip"

    try:
        # Stream to disk, enforcing the max size
        max_bytes = settings.max_upload_mb * 1024 * 1024
        written = 0
        with open(zip_path, "wb") as out:
            while chunk := await file.read(1 << 20):
                written += len(chunk)
                if written > max_bytes:
                    raise HTTPException(
                        413, f"Upload exceeds {settings.max_upload_mb} MB limit"
                    )
                out.write(chunk)

        source_dir = workspace / "source"
        try:
            safe_extract_zip(zip_path, source_dir)
        except UnsafeArchiveError as e:
            raise HTTPException(400, str(e))

        zip_path.unlink(missing_ok=True)

        # Analyze
        project_types = detect_project_types(source_dir)
        languages = detect_languages(source_dir)
        analysis = analyze_repository(source_dir)
        
        # Run static analysis and dependency graph
        findings = analyze_static(source_dir)
        dependencies = build_dependency_graph(source_dir)

        return RepositoryAnalysisOut(
            repo_id=repo_id,
            project_types=project_types,
            languages=languages,
            findings=[FindingOut(**f) for f in findings],
            dependencies=dependencies,
            **analysis, # this unpacks python_files, total_functions, etc.
        )

    except HTTPException:
        delete_workspace(repo_id)
        raise
    except Exception as e:
        log.exception("Upload failed for repo %s", repo_id)
        delete_workspace(repo_id)
        raise HTTPException(500, f"Analysis failed: {e}")