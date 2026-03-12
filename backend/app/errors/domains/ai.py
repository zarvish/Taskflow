"""AI-domain error codes and exceptions."""
from __future__ import annotations

from enum import StrEnum, auto

from app.errors.base import AppError
from app.errors.registry import error_registry


class AIErrorCode(StrEnum):
    AI_SERVICE_ERROR = auto()


error_registry.register_many({AIErrorCode.AI_SERVICE_ERROR: 502})


class AIServiceError(AppError):
    def __init__(self, message: str = "AI service unavailable or failed."):
        super().__init__(AIErrorCode.AI_SERVICE_ERROR, message)
