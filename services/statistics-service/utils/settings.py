from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    grpc_port: int = 50055

    kafka_host: str
    kafka_port: int
    kafka_group_id: str = "statistics-service-v2"

    database_url: str

    redis_host: str
    redis_port: int
    redis_password: str


settings = Settings()
