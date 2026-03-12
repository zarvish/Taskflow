"""Task-domain error codes and exceptions."""
from __future__ import annotations

from enum import StrEnum, auto
from typing import Any

from app.errors.base import AppError
from app.errors.registry import error_registry


class TaskErrorCode(StrEnum):
    TASK_NOT_FOUND = auto()
    INVALID_TRANSITION = auto()
    DEPENDENCY_BLOCKED = auto()
    CIRCULAR_DEPENDENCY = auto()
    SUBTASKS_INCOMPLETE = auto()


# 404 = not found, 400 = client error, 403 = forbidden
_STATUS = (404, 400, 400, 400, 400)
error_registry.register_many(dict(zip(TaskErrorCode, _STATUS)))


class TaskNotFoundError(AppError):
    def __init__(self, message: str = "Task not found."):
        super().__init__(TaskErrorCode.TASK_NOT_FOUND, message)


class InvalidTransitionError(AppError):
    def __init__(self, message: str, from_status: str, to_status: str):
        super().__init__(
            TaskErrorCode.INVALID_TRANSITION,
            message,
            details={"from": from_status, "to": to_status},
        )


class DependencyBlockedError(AppError):
    def __init__(self, message: str, blocking_tasks: list[dict[str, Any]]):
        super().__init__(
            TaskErrorCode.DEPENDENCY_BLOCKED,
            message,
            details={"blocking_tasks": blocking_tasks},
        )


class CircularDependencyError(AppError):
    def __init__(self, message: str, cycle: list[str]):
        super().__init__(
            TaskErrorCode.CIRCULAR_DEPENDENCY,
            message,
            details={"cycle": cycle},
        )


class SubtasksIncompleteError(AppError):
    def __init__(self, message: str = "Cannot mark task done while subtasks are incomplete."):
        super().__init__(TaskErrorCode.SUBTASKS_INCOMPLETE, message)
