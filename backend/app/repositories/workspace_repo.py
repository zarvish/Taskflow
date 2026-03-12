"""Workspace repository — DB access only."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from app.extensions import db
from app.models.workspace import Workspace


class WorkspaceRepository:
    def get_by_id(self, workspace_id: int, include_deleted: bool = False) -> Optional[Workspace]:
        q = Workspace.query.filter_by(id=workspace_id)
        if not include_deleted:
            q = q.filter_by(deleted_at=None)
        return q.first()

    def list_all(self) -> list[Workspace]:
        return Workspace.query.filter_by(deleted_at=None).order_by(Workspace.id).all()

    def create(self, name: str, description: Optional[str] = None, owner_id: Optional[str] = None) -> Workspace:
        w = Workspace(name=name, description=description, owner_id=owner_id)
        db.session.add(w)
        db.session.commit()
        return w

    def update(self, workspace: Workspace, **kwargs) -> Workspace:
        for k, v in kwargs.items():
            if hasattr(workspace, k):
                setattr(workspace, k, v)
        db.session.commit()
        return workspace

    def soft_delete(self, workspace: Workspace) -> None:
        workspace.deleted_at = datetime.now(timezone.utc)
        db.session.commit()


workspace_repo = WorkspaceRepository()
