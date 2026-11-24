from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    upload_dir: Path = Path("./storage/repositories")
    max_upload_mb: int = 100
    log_level: str = "INFO"
    
    # Default to localhost if env var is missing, but Render will override this
    cors_origins: str = "http://localhost:5173"
    
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    llm_base_url: str = "https://api.openai.com/v1"

    @property
    def cors_origin_list(self) -> list[str]:
        # Splits comma-separated values into a clean list
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)