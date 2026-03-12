"""Task model — belongs to project; FSM status, priority, due_date."""
from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from app.extensions import db
from app.fsm import TaskStatus

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.subtask import Subtask
    from app.models.activity_log import ActivityLog


class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    title = db.Column(db.String(512), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(
        db.String(32),
        nullable=False,
        default=TaskStatus.BACKLOG.value,
    )
    priority = db.Column(
        db.Enum(Priority),
        nullable=False,
        default=Priority.MEDIUM,
    )
    due_date = db.Column(db.Date, nullable=True)
    assignee_id = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = db.Column(db.DateTime(timezone=True), nullable=True)

    project = db.relationship("Project", back_populates="tasks")
    subtasks = db.relationship(
        "Subtask",
        back_populates="task",
        lazy="dynamic",
        foreign_keys="Subtask.task_id",
    )
    activity_logs = db.relationship(
        "ActivityLog",
        back_populates="task",
        lazy="dynamic",
        order_by="ActivityLog.created_at",
    )
    # Dependencies: this task is blocked by (depends on) depends_on_tasks
    depends_on_tasks = db.relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.task_id",
        back_populates="task",
        lazy="dynamic",
    )
    blocking_deps = db.relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.depends_on_task_id",
        back_populates="depends_on_task",
        lazy="dynamic",
    )

    def __repr__(self) -> str:
        return f"<Task {self.id} {self.title[:30]}>"

    @property
    def is_overdue(self) -> bool:
        if self.due_date is None:
            return False
        from datetime import date
        return self.due_date < date.today()

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
