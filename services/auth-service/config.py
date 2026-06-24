from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    grpc_port: int = 50051
    database_url: str
    redis_url: str = "redis://redis:6379"
    kafka_bootstrap_servers: str = "kafka:9092"

    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str

    jwt_private_key_path: str = "./secrets/jwt_private.pem"
    jwt_public_key_path: str = "./secrets/jwt_public.pem"
    jwt_access_token_expire_minutes: int = 15
    jwt_access_token_algorithm: str = "RS256"
    jwt_refresh_token_expire_days: int = 30


settings = Settings()
