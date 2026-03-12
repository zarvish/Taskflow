"""Common error codes (validation, internal, generic not-found)."""
from __future__ import annotations

from enum import StrEnum, auto

from app.errors.base import AppError
from app.errors.registry import error_registry


class CommonErrorCode(StrEnum):
    VALIDATION_ERROR = auto()
    INTERNAL_ERROR = auto()
    WORKSPACE_NOT_FOUND = auto()


# 422 validation, 500 internal, 404 not found
error_registry.register_many(dict(zip(CommonErrorCode, (422, 500, 404))))


class NotFoundError(AppError):
    """Generic not-found for common resources (e.g. workspace). Pass code + message."""
    def __init__(self, code: CommonErrorCode, message: str):
        super().__init__(code, message)
