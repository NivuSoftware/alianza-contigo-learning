import os


class BaseConfig:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-development-secret")
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    JWT_COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "Lax")
    JWT_ACCESS_COOKIE_NAME = "alianza_access_token"
    JWT_REFRESH_COOKIE_NAME = "alianza_refresh_token"
    JWT_ACCESS_CSRF_COOKIE_NAME = "alianza_access_csrf"
    JWT_REFRESH_CSRF_COOKIE_NAME = "alianza_refresh_csrf"
    JWT_ACCESS_TOKEN_EXPIRES = 900
    JWT_REFRESH_TOKEN_EXPIRES = 60 * 60 * 24 * 30
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
    MAIL_SENDER = os.getenv("MAIL_SENDER", "Alianza Contigo")
    MAIL_RECIPIENT = os.getenv("MAIL_RECIPIENT") or EMAIL_ADDRESS
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/app/uploads")
    # The global ceiling must accommodate course videos. The upload endpoint applies
    # stricter per-type limits to images and documents.
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_UPLOAD_MB", "500")) * 1024 * 1024
    MAX_DOCUMENT_UPLOAD_MB = int(os.getenv("MAX_DOCUMENT_UPLOAD_MB", "25"))
    MAX_VIDEO_UPLOAD_MB = int(os.getenv("MAX_VIDEO_UPLOAD_MB", "500"))
    BANK_NAME = os.getenv("BANK_NAME", "Banco Pichincha")
    BANK_ACCOUNT_TYPE = os.getenv("BANK_ACCOUNT_TYPE", "Cuenta corriente")
    BANK_ACCOUNT_NUMBER = os.getenv("BANK_ACCOUNT_NUMBER", "0000000000")
    BANK_ACCOUNT_HOLDER = os.getenv("BANK_ACCOUNT_HOLDER", "Alianza Contigo")
    BANK_ACCOUNT_ID = os.getenv("BANK_ACCOUNT_ID", "0000000000")
    PAYPHONE_STORE_ID = os.getenv("PAYPHONE_STORE_ID", "")
    PAYPHONE_TOKEN = os.getenv("PAYPHONE_TOKEN", "")


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://alianza:alianza@localhost:5432/alianza_contigo",
    )


class ProductionConfig(BaseConfig):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "")


def get_config():
    if os.getenv("FLASK_ENV") == "production" and not ProductionConfig.SQLALCHEMY_DATABASE_URI:
        raise RuntimeError("DATABASE_URL is required in production")
    return ProductionConfig if os.getenv("FLASK_ENV") == "production" else DevelopmentConfig
