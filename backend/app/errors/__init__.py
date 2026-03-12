"""Centralized error handling — module-based; each domain owns its codes and exceptions."""
from __future__ import annotations

from .base import AppError, build_error_payload, code_value
from .registry import error_registry
from .handlers import register_error_handlers

# Import domains so they register codes; then re-export exceptions and codes
from . import domains  # noqa: F401
from .domains import (
    TaskErrorCode,
    TaskNotFoundError,
    InvalidTransitionError,
    DependencyBlockedError,
    CircularDependencyError,
    SubtasksIncompleteError,
    ProjectErrorCode,
    ProjectNotFoundError,
    ProjectArchivedError,
    CommonErrorCode,
    NotFoundError,
    AIErrorCode,
    AIServiceError,
)

__all__ = [
    "AppError",
    "build_error_payload",
    "code_value",
    "error_registry",
    "register_error_handlers",
    "TaskErrorCode",
    "TaskNotFoundError",
    "InvalidTransitionError",
    "DependencyBlockedError",
    "CircularDependencyError",
    "SubtasksIncompleteError",
    "ProjectErrorCode",
    "ProjectNotFoundError",
    "ProjectArchivedError",
    "CommonErrorCode",
    "NotFoundError",
    "AIErrorCode",
    "AIServiceError",
]
