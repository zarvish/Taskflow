"""Workspace model — top-level container; soft-delete only."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from app.extensions import db

if TYPE_CHECKING:
    from app.models.project import Project


class Workspace(db.Model):
    __tablename__ = "workspaces"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    owner_id = db.Column(db.String(255), nullable=True)  # placeholder until auth
    deleted_at = db.Column(db.DateTime(timezone=True), nullable=True)

    projects = db.relationship("Project", back_populates="workspace", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Workspace {self.id} {self.name}>"

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
