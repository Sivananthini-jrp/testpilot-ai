from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent # This goes up to the 'backend' folder

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Change this line so it saves inside the backend folder
    upload_dir: Path = BASE_DIR / "storage" / "repositories" 
    
    max_upload_mb: int = 100
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173"
    
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    llm_base_url: str = "https://api.openai.com/v1"
    
    database_url: str = Field(default="sqlite:///./testpilot.db", validation_alias="DATABASE_URL")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)