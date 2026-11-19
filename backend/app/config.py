from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "travora_db"
    secret_key: str = "travora-super-secret-key-2024"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    openweather_api_key: str = ""
    google_maps_api_key: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
