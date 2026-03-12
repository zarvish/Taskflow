"""Task repository — DB access only."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from app.extensions import db
from app.models.task import Task


class TaskRepository:
    def get_by_id(self, task_id: int, include_deleted: bool = False) -> Optional[Task]:
        q = Task.query.filter_by(id=task_id)
        if not include_deleted:
            q = q.filter_by(deleted_at=None)
        return q.first()

    def list_by_project(self, project_id: int) -> list[Task]:
        return (
            Task.query.filter_by(project_id=project_id, deleted_at=None)
            .order_by(Task.created_at)
            .all()
        )

    def create(self, project_id: int, title: str, **kwargs) -> Task:
        t = Task(project_id=project_id, title=title, **kwargs)
        db.session.add(t)
        db.session.commit()
        return t

    def update(self, task: Task, **kwargs) -> Task:
        for k, v in kwargs.items():
            if hasattr(task, k):
                setattr(task, k, v)
        db.session.commit()
        return task

    def soft_delete(self, task: Task) -> None:
        task.deleted_at = datetime.now(timezone.utc)
        db.session.commit()


task_repo = TaskRepository()
