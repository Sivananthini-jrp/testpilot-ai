import shutil
import json
from pathlib import Path
from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from sqlalchemy.orm import Session

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
from app.database import get_db
from app import models

log = get_logger(__name__)
router = APIRouter(prefix="/repositories", tags=["repositories"])

@router.post("/upload", response_model=RepositoryAnalysisOut)
async def upload_repository(file: UploadFile = File(...), db: Session = Depends(get_db)) -> RepositoryAnalysisOut:
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(400, "Only .zip files are accepted")

    repo_id = new_repo_id()
    workspace = create_workspace(repo_id)
    zip_path = workspace / "upload.zip"

    try:
        max_bytes = settings.max_upload_mb * 1024 * 1024
        written = 0
        with open(zip_path, "wb") as out:
            while chunk := await file.read(1 << 20):
                written += len(chunk)
                if written > max_bytes:
                    raise HTTPException(413, f"Upload exceeds {settings.max_upload_mb} MB limit")
                out.write(chunk)

        source_dir = workspace / "source"
        try:
            safe_extract_zip(zip_path, source_dir)
        except UnsafeArchiveError as e:
            raise HTTPException(400, str(e))

        zip_path.unlink(missing_ok=True)

        project_types = detect_project_types(source_dir)
        languages = detect_languages(source_dir)
        analysis = analyze_repository(source_dir)
        findings = analyze_static(source_dir)
        dependencies = build_dependency_graph(source_dir)
        
        db_repo = models.Repository(
            id=repo_id,
            project_types=json.dumps(project_types),
            languages=json.dumps(languages)
        )
        db.add(db_repo)
        db.commit()

        return RepositoryAnalysisOut(
            repo_id=repo_id,
            project_types=project_types,
            languages=languages,
            findings=[FindingOut(**f) for f in findings],
            dependencies=dependencies,
            **analysis,
        )

    except HTTPException:
        delete_workspace(repo_id)
        raise
    except Exception as e:
        log.exception("Upload failed for repo %s", repo_id)
        db.rollback()
        delete_workspace(repo_id)
        raise HTTPException(500, f"Analysis failed: {e}")


@router.get("/list")
async def list_repositories(db: Session = Depends(get_db)):
    repos = db.query(models.Repository).order_by(models.Repository.created_at.desc()).all()
    return [
        {
            "repo_id": r.id, 
            "project_types": json.loads(r.project_types), 
            "languages": json.loads(r.languages), 
            "date": r.created_at.isoformat()
        } for r in repos
    ]

@router.get("/{repo_id}")
async def get_repository_analysis(repo_id: str, db: Session = Depends(get_db)):
    db_repo = db.query(models.Repository).filter(models.Repository.id == repo_id).first()
    if not db_repo:
        raise HTTPException(404, "Repository not found in database")

    source_dir = settings.upload_dir / repo_id / "source"
    if not source_dir.exists():
        raise HTTPException(404, "Repository files no longer exist on the server. Please re-upload.")

    try:
        project_types = json.loads(db_repo.project_types)
        languages = json.loads(db_repo.languages)
        analysis = analyze_repository(source_dir)
        findings = analyze_static(source_dir)
        dependencies = build_dependency_graph(source_dir)

        return RepositoryAnalysisOut(
            repo_id=repo_id,
            project_types=project_types,
            languages=languages,
            findings=[FindingOut(**f) for f in findings],
            dependencies=dependencies,
            **analysis,
        )
    except Exception as e:
        raise HTTPException(500, f"Failed to load analysis: {e}")