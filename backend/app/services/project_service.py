"""Project service — business logic for projects."""
from __future__ import annotations

from app.errors.domains.project import ProjectNotFoundError
from app.repositories.project_repo import project_repo
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse


class ProjectService:
    def get(self, project_id: int) -> ProjectResponse:
        project = project_repo.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        return self._to_response(project)

    def list(self, workspace_id: int) -> list[ProjectResponse]:
        projects = project_repo.list_by_workspace(workspace_id)
        return [self._to_response(p) for p in projects]

    def create(self, data: ProjectCreate) -> ProjectResponse:
        from app.models.project import ProjectStatus
        
        project = project_repo.create(
            workspace_id=data.workspace_id,
            name=data.name,
            description=data.description,
            color=data.color,
            icon=data.icon,
            status=ProjectStatus.ACTIVE,
        )
        return self._to_response(project)

    def update(self, project_id: int, data: ProjectUpdate) -> ProjectResponse:
        project = project_repo.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        kwargs = data.model_dump(exclude_unset=True)
        if "status" in kwargs and kwargs["status"] is not None:
            from app.models.project import ProjectStatus
            kwargs["status"] = ProjectStatus(kwargs["status"])
        project_repo.update(project, **kwargs)
        return self._to_response(project)

    def delete(self, project_id: int) -> None:
        project = project_repo.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        project_repo.soft_delete(project)

    def _to_response(self, project) -> ProjectResponse:
        return ProjectResponse(
            id=project.id,
            workspace_id=project.workspace_id,
            name=project.name,
            description=project.description,
            color=project.color,
            icon=project.icon,
            status=project.status.value if hasattr(project.status, "value") else str(project.status),
            owner_id=project.owner_id,
        )


project_service = ProjectService()
