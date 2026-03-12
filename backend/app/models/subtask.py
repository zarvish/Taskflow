"""Subtask model — one level only; parent task cannot be done until all complete."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from app.extensions import db
from app.fsm import TaskStatus

if TYPE_CHECKING:
    from app.models.task import Task


class Subtask(db.Model):
    __tablename__ = "subtasks"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
    title = db.Column(db.String(512), nullable=False)
    status = db.Column(
        db.String(32),
        nullable=False,
        default=TaskStatus.TODO.value,
    )
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    task = db.relationship("Task", back_populates="subtasks", foreign_keys=[task_id])

    def __repr__(self) -> str:
        return f"<Subtask {self.id} {self.title[:30]}>"

    @property
    def is_complete(self) -> bool:
        return self.status == TaskStatus.DONE.value
