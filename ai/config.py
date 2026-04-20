from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    PROXY_API_KEY: str = ""
    PROXY_BASE_URL: str = "https://pg.ebebot.click/api/proxy"
    SQL_MODEL: str = "claude-haiku-4-5-20251001"
    OCR_MODEL: str = "gpt-5.4-mini"
    DATABASE_URL: str = ""
    INTERNAL_SHARED_TOKEN: str = ""

    # LLM
    LLM_TIMEOUT: int = 30
    LLM_MAX_RETRIES: int = 2

    # Database
    DB_STATEMENT_TIMEOUT_MS: int = 10000

    # Rate limiting (slowapi format)
    RATE_LIMIT_CHAT: str = "10/minute"
    RATE_LIMIT_OCR: str = "5/minute"
    RATE_LIMIT_VOICE: str = "10/minute"
    RATE_LIMIT_DEFAULT: str = "30/minute"

    # AI logging / tracing
    AI_LOG_LEVEL: str = "INFO"
    AI_TRACE_ENABLED: bool = True
    AI_TRACE_LOG_PROMPTS: bool = False
    AI_TRACE_MAX_PREVIEW_CHARS: int = 800
    AI_TRACE_PRINT_STDOUT: bool = True

    model_config = SettingsConfigDict(
        env_file=(
            str(Path(__file__).parent.parent / ".env.prod"),
            str(Path(__file__).parent / ".env"),
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
