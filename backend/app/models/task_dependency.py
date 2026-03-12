"""TaskDependency — task_id is blocked by depends_on_task_id (same project)."""
from __future__ import annotations

from typing import TYPE_CHECKING

from app.extensions import db

if TYPE_CHECKING:
    from app.models.task import Task


class TaskDependency(db.Model):
    __tablename__ = "task_dependencies"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
    depends_on_task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)

    task = db.relationship("Task", foreign_keys=[task_id], back_populates="depends_on_tasks")
    depends_on_task = db.relationship(
        "Task",
        foreign_keys=[depends_on_task_id],
        back_populates="blocking_deps",
    )

    def __repr__(self) -> str:
        return f"<TaskDependency {self.task_id} -> {self.depends_on_task_id}>"
