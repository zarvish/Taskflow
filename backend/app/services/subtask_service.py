"""Subtask service — business logic for subtasks."""
from __future__ import annotations

from app.errors.domains.project import ProjectArchivedError
from app.errors.domains.task import TaskNotFoundError
from app.repositories.activity_repo import activity_repo
from app.repositories.subtask_repo import subtask_repo
from app.repositories.task_repo import task_repo
from app.schemas.subtask import SubtaskCreate, SubtaskResponse, SubtaskUpdate


class SubtaskService:
    def list(self, task_id: int) -> list[SubtaskResponse]:
        task = task_repo.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError()
        subtasks = subtask_repo.list_by_task(task_id)
        return [SubtaskResponse.model_validate(s) for s in subtasks]

    def create(self, task_id: int, data: SubtaskCreate, actor_id: str | None = None) -> SubtaskResponse:
        task = task_repo.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError()
        if task.project.is_archived:
            raise ProjectArchivedError()
        st = subtask_repo.create(task_id, data.title)
        activity_repo.append(task_id, "subtask_created", old_value=None, new_value=st.title, actor_id=actor_id)
        return SubtaskResponse.model_validate(st)
    def update(self, task_id: int, subtask_id: int, data: SubtaskUpdate, actor_id: str | None = None) -> SubtaskResponse:
        st = subtask_repo.update(subtask_id, status=data.status, title=data.title)
        if not st:
            raise TaskNotFoundError()
        
        if data.status:
            activity_repo.append(task_id, "subtask_status", old_value=None, new_value=data.status, actor_id=actor_id)

        return SubtaskResponse.model_validate(st)
    def delete(self, task_id: int, subtask_id: int, actor_id: str | None = None) -> None:
        deleted = subtask_repo.delete(subtask_id)
        if deleted:
            activity_repo.append(task_id, "subtask_deleted", old_value=str(subtask_id), new_value=None, actor_id=actor_id)


subtask_service = SubtaskService()

