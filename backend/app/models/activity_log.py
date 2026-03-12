"""ActivityLog — append-only audit trail; no update/delete."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from app.extensions import db

if TYPE_CHECKING:
    from app.models.task import Task


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
    actor_id = db.Column(db.String(255), nullable=True)
    field_name = db.Column(db.String(64), nullable=False)
    old_value = db.Column(db.Text, nullable=True)
    new_value = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    task = db.relationship("Task", back_populates="activity_logs")

    def __repr__(self) -> str:
        return f"<ActivityLog {self.id} task={self.task_id} {self.field_name}>"
