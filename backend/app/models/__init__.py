"""SQLAlchemy models — import all so Alembic can discover them."""
from __future__ import annotations

from app.extensions import db
from app.models.workspace import Workspace
from app.models.project import Project
from app.models.task import Task
from app.models.subtask import Subtask
from app.models.activity_log import ActivityLog
from app.models.task_dependency import TaskDependency

__all__ = [
    "db",
    "Workspace",
    "Project",
    "Task",
    "Subtask",
    "ActivityLog",
    "TaskDependency",
]
