"""Data access layer — DB only, no business logic."""
from __future__ import annotations

from app.repositories.project_repo import project_repo
from app.repositories.task_repo import task_repo
from app.repositories.activity_repo import activity_repo
from app.repositories.dependency_repo import dependency_repo
from app.repositories.subtask_repo import subtask_repo

__all__ = [
    "project_repo",
    "task_repo",
    "activity_repo",
    "dependency_repo",
    "subtask_repo",
]
