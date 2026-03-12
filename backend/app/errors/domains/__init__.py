"""Domain-specific error codes and exceptions. Import all to register codes."""
from __future__ import annotations

# Import domains so they register their codes with the central registry.
# Then re-export for convenience.
from app.errors.domains import task as _task
from app.errors.domains import project as _project
from app.errors.domains import common as _common
from app.errors.domains import ai as _ai

from app.errors.domains.task import (
    TaskErrorCode,
    TaskNotFoundError,
    InvalidTransitionError,
    DependencyBlockedError,
    CircularDependencyError,
    SubtasksIncompleteError,
)
from app.errors.domains.project import (
    ProjectErrorCode,
    ProjectNotFoundError,
    ProjectArchivedError,
)
from app.errors.domains.common import (
    CommonErrorCode,
    NotFoundError,
)
from app.errors.domains.ai import (
    AIErrorCode,
    AIServiceError,
)

__all__ = [
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
