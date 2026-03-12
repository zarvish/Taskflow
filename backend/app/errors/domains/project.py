"""Project-domain error codes and exceptions."""
from __future__ import annotations

from enum import StrEnum, auto

from app.errors.base import AppError
from app.errors.registry import error_registry


class ProjectErrorCode(StrEnum):
    PROJECT_NOT_FOUND = auto()
    PROJECT_ARCHIVED = auto()


error_registry.register_many(dict(zip(ProjectErrorCode, (404, 403))))


class ProjectNotFoundError(AppError):
    def __init__(self, message: str = "Project not found."):
        super().__init__(ProjectErrorCode.PROJECT_NOT_FOUND, message)


class ProjectArchivedError(AppError):
    def __init__(self, message: str = "Project is archived; modifications not allowed."):
        super().__init__(ProjectErrorCode.PROJECT_ARCHIVED, message)
