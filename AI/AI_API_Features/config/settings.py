"""
Configuration settings for the Food Recognition API
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_TITLE: str = "Food Recognition API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "AI-powered food recognition API with nutritional database"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Database Configuration
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "icoach_db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "123"
    
    # Model Configuration
    MODEL_PATH: Path = Path(__file__).parent.parent.parent / "food_predict_feature" / "best_model_food100.keras"
    CLASS_NAMES_PATH: Path = Path(__file__).parent.parent.parent / "food_predict_feature" / "class_names.json"
    IMG_SIZE: int = 224
    NUM_CLASSES: int = 100
    
    # Upload Configuration
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp"}
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8081,http://localhost:19000,http://localhost:19001,exp://localhost:8081,exp://192.168.1.6:8081"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string"""
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS
    
    @property
    def database_url(self) -> str:
        """Generate PostgreSQL database URL"""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
