from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "FindingUsers"
    environment: str = "development"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/findingusers"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # Auth (magic link)
    resend_api_key: str = ""
    secret_key: str = "changeme-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # LLM
    anthropic_api_key: str = ""
    default_model: str = "claude-sonnet-4-6"

    # Reddit connector (feature-flagged)
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "FindingUsers/0.1"

    # X / Twitter connector (feature-flagged)
    x_bearer_token: str = ""
    x_daily_request_cap: int = 500

    # Notion
    notion_oauth_client_id: str = ""
    notion_oauth_client_secret: str = ""

    # Google
    google_oauth_client_id: str = ""
    google_oauth_client_secret: str = ""

    # Sentry
    sentry_dsn: str = ""

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
