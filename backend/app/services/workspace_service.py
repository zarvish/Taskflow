"""Workspace service — business logic for workspaces."""
from __future__ import annotations

from app.repositories.workspace_repo import workspace_repo
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse


class WorkspaceNotFoundError(Exception):
    pass


class WorkspaceService:
    def get(self, workspace_id: int) -> WorkspaceResponse:
        ws = workspace_repo.get_by_id(workspace_id)
        if not ws:
            raise WorkspaceNotFoundError(f"Workspace {workspace_id} not found")
        return self._to_response(ws)

    def list_all(self) -> list[WorkspaceResponse]:
        workspaces = workspace_repo.list_all()
        return [self._to_response(w) for w in workspaces]

    def create(self, data: WorkspaceCreate) -> WorkspaceResponse:
        ws = workspace_repo.create(
            name=data.name,
            description=data.description,
        )
        return self._to_response(ws)

    def update(self, workspace_id: int, data: WorkspaceUpdate) -> WorkspaceResponse:
        ws = workspace_repo.get_by_id(workspace_id)
        if not ws:
            raise WorkspaceNotFoundError(f"Workspace {workspace_id} not found")
        kwargs = data.model_dump(exclude_unset=True)
        workspace_repo.update(ws, **kwargs)
        return self._to_response(ws)

    def delete(self, workspace_id: int) -> None:
        ws = workspace_repo.get_by_id(workspace_id)
        if not ws:
            raise WorkspaceNotFoundError(f"Workspace {workspace_id} not found")
        workspace_repo.soft_delete(ws)

    def _to_response(self, ws) -> WorkspaceResponse:
        return WorkspaceResponse(
            id=ws.id,
            name=ws.name,
            description=ws.description,
            owner_id=ws.owner_id,
        )


workspace_service = WorkspaceService()
