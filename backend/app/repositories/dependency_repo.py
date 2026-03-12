"""Task dependency repository — DB access only."""
from __future__ import annotations

from typing import Optional

from app.extensions import db
from app.models.task_dependency import TaskDependency


class DependencyRepository:
    def get_by_id(self, dep_id: int) -> Optional[TaskDependency]:
        return TaskDependency.query.filter_by(id=dep_id).first()

    def get(self, task_id: int, depends_on_task_id: int) -> Optional[TaskDependency]:
        return TaskDependency.query.filter_by(
            task_id=task_id, depends_on_task_id=depends_on_task_id
        ).first()

    def add(self, task_id: int, depends_on_task_id: int) -> TaskDependency:
        dep = TaskDependency(task_id=task_id, depends_on_task_id=depends_on_task_id)
        db.session.add(dep)
        db.session.commit()
        return dep

    def delete(self, dep: TaskDependency) -> None:
        db.session.delete(dep)
        db.session.commit()

    def list_blocked_by(self, task_id: int):
        """Task IDs that this task depends on (blocked by)."""
        return [
            d.depends_on_task_id
            for d in TaskDependency.query.filter_by(task_id=task_id).all()
        ]

    def list_blocking(self, task_id: int):
        """Task IDs that depend on this task (blocking)."""
        return [
            d.task_id
            for d in TaskDependency.query.filter_by(depends_on_task_id=task_id).all()
        ]


dependency_repo = DependencyRepository()
