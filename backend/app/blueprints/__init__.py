"""Flask blueprints."""
from __future__ import annotations

from .health import health_bp
from .projects import projects_bp
from .tasks import tasks_bp
from .task_related import task_related_bp
from .workspaces import workspaces_bp

__all__ = ["health_bp", "projects_bp", "tasks_bp", "task_related_bp", "workspaces_bp"]
