from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    upload_dir: Path = Path("./storage/repositories")
    max_upload_mb: int = 100
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173"
    
    # LLM Config
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    llm_base_url: str = "https://api.openai.com/v1"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)