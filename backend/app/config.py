"""Application configuration from environment."""
from __future__ import annotations

import os
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    """Flask app configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    SECRET_KEY: str = os.urandom(24).hex()
    ENV: str = "development"
    DEBUG: bool = True
    TESTING: bool = False

    # Database
    SQLALCHEMY_DATABASE_URI: str = "postgresql://localhost/taskflow"
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    SQLALCHEMY_ENGINE_OPTIONS: dict = {}

    # App metadata for health
    APP_VERSION: str = "0.1.0"
