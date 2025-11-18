import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Healthcare Booking System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./healthcare.db")
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # AI Service settings
    AI_SERVICE_URL: str = os.getenv("AI_SERVICE_URL", "http://localhost:8001/analyze-symptoms")
    FALLBACK_AI_ENABLED: bool = os.getenv("FALLBACK_AI_ENABLED", "true").lower() == "true"
    
    # Video Consultation settings
    GOOGLE_SERVICE_ACCOUNT_FILE: str = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "")
    GOOGLE_CALENDAR_ID: str = os.getenv("GOOGLE_CALENDAR_ID", "primary")
    FALLBACK_VIDEO_SERVICE: str = os.getenv("FALLBACK_VIDEO_SERVICE", "zoom")
    ZOOM_API_KEY: str = os.getenv("ZOOM_API_KEY", "")
    ZOOM_API_SECRET: str = os.getenv("ZOOM_API_SECRET", "")
    
    # Notification settings
    EMAIL_SERVICE_URL: str = os.getenv("EMAIL_SERVICE_URL", "")
    SMS_SERVICE_URL: str = os.getenv("SMS_SERVICE_URL", "")
    PUSH_SERVICE_URL: str = os.getenv("PUSH_SERVICE_URL", "")
    
    # Telephony settings
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    VONAGE_API_KEY: str = os.getenv("VONAGE_API_KEY", "")
    VONAGE_API_SECRET: str = os.getenv("VONAGE_API_SECRET", "")
    VONAGE_PHONE_NUMBER: str = os.getenv("VONAGE_PHONE_NUMBER", "")
    
    # File upload settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB default
    ALLOWED_FILE_TYPES: list[str] = os.getenv(
        "ALLOWED_FILE_TYPES", "pdf,jpg,jpeg,png,doc,docx"
    ).split(",")

    class Config:
        env_file = ".env"

settings = Settings()
