"""Project model — belongs to workspace; active | archived."""
from __future__ import annotations

import enum
from typing import TYPE_CHECKING

from app.extensions import db

if TYPE_CHECKING:
    from app.models.workspace import Workspace
    from app.models.task import Task


class ProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey("workspaces.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(32), nullable=True)
    icon = db.Column(db.String(32), nullable=True)
    status = db.Column(
        db.Enum(ProjectStatus),
        nullable=False,
        default=ProjectStatus.ACTIVE,
    )
    owner_id = db.Column(db.String(255), nullable=True)
    deleted_at = db.Column(db.DateTime(timezone=True), nullable=True)

    workspace = db.relationship("Workspace", back_populates="projects")
    tasks = db.relationship("Task", back_populates="project", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Project {self.id} {self.name}>"

    @property
    def is_archived(self) -> bool:
        return self.status == ProjectStatus.ARCHIVED

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
