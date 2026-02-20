import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=os.environ.get("ENV_FILE_PATH", ".env"))
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_secure: bool = False
    minio_cert_check: bool = True
    minio_ca_certs: str | None = None  # Path to CA bundle
    minio_relaxed_ssl: bool = False  # Option for relaxed SSL (pre-3.13)
    minio_webhook_key: str | None = None
    api_keys: str  # Comma-separated list of valid API keys
    tile_size: int = 254
    tile_overlap: int = 1


settings = Settings()
