from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/learn_greek"
    app_name: str = "Learn Greek API"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:5173", "https://paulacoroneos.github.io"]


settings = Settings()
