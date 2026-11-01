from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "MOTOSYNQ AI Backend API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    SUPABASE_URL: str = ""
    SUPABASE_JWKS_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    ALLOWED_ORIGINS: str = "*"
    MAX_AUDIO_MB: int = 50
    MAX_CSV_MB: int = 20
    
    MODEL_PATH: str = "./app/ml/artifacts/model.joblib"
    MODEL_CARD_PATH: str = "./app/ml/artifacts/model_card.json"
    CONFIDENCE_THRESHOLD: float = 0.60
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
