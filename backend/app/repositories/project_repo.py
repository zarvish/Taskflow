"""Project repository — DB access only."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from app.extensions import db
from app.models.project import Project


class ProjectRepository:
    def get_by_id(self, project_id: int, include_deleted: bool = False) -> Optional[Project]:
        q = Project.query.filter_by(id=project_id)
        if not include_deleted:
            q = q.filter_by(deleted_at=None)
        return q.first()

    def list_by_workspace(self, workspace_id: int) -> list[Project]:
        return (
            Project.query.filter_by(workspace_id=workspace_id, deleted_at=None)
            .order_by(Project.name)
            .all()
        )

    def create(self, workspace_id: int, name: str, **kwargs) -> Project:
        p = Project(workspace_id=workspace_id, name=name, **kwargs)
        db.session.add(p)
        db.session.commit()
        return p

    def update(self, project: Project, **kwargs) -> Project:
        for k, v in kwargs.items():
            if hasattr(project, k):
                setattr(project, k, v)
        db.session.commit()
        return project

    def soft_delete(self, project: Project) -> None:
        project.deleted_at = datetime.now(timezone.utc)
        db.session.commit()


project_repo = ProjectRepository()
