"""Task service — business logic for tasks and transitions."""
from __future__ import annotations

from app.errors.domains.project import ProjectArchivedError, ProjectNotFoundError
from app.errors.domains.task import (
    DependencyBlockedError,
    SubtasksIncompleteError,
    TaskNotFoundError,
)
from app.fsm import apply_transition
from app.models.subtask import Subtask
from app.models.task import Priority
from app.repositories.activity_repo import activity_repo
from app.repositories.dependency_repo import dependency_repo
from app.repositories.project_repo import project_repo
from app.repositories.task_repo import task_repo
from app.schemas.task import TaskCreate, TaskTransitionRequest, TaskUpdate, TaskResponse


class TaskService:
    def list_by_project(self, project_id: int) -> list[TaskResponse]:
        project = project_repo.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        tasks = task_repo.list_by_project(project_id)
        return [self._to_response(t) for t in tasks]

    def get(self, task_id: int) -> TaskResponse:
        task = task_repo.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError()
        return self._to_response(task)

    def create(self, project_id: int, data: TaskCreate, actor_id: str | None = None) -> TaskResponse:
        project = project_repo.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        if project.is_archived:
            raise ProjectArchivedError()

        task = task_repo.create(
            project_id=project_id,
            title=data.title,
            description=data.description,
            priority=Priority(data.priority),
            due_date=data.due_date,
            assignee_id=data.assignee_id,
        )
        activity_repo.append(task.id, "created", old_value=None, new_value=task.title, actor_id=actor_id)
        return self._to_response(task)

    def update(self, task_id: int, data: TaskUpdate, actor_id: str | None = None) -> TaskResponse:
        task = task_repo.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError()
        if task.project.is_archived:
            raise ProjectArchivedError()

        kwargs = data.model_dump(exclude_unset=True)
        if "priority" in kwargs and kwargs["priority"] is not None:
            kwargs["priority"] = Priority(kwargs["priority"])
        old = {
            "title": task.title,
            "description": task.description,
            "priority": task.priority.value if hasattr(task.priority, "value") else str(task.priority),
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "assignee_id": task.assignee_id,
        }
        task_repo.update(task, **kwargs)

        # Minimal audit: log only changed fields.
        for field, old_value in old.items():
            new_value = getattr(task, field)
            if hasattr(new_value, "value"):
                new_value = new_value.value
            if hasattr(new_value, "isoformat"):
                new_value = new_value.isoformat()
            if old_value != new_value:
                activity_repo.append(task.id, field, old_value=str(old_value), new_value=str(new_value), actor_id=actor_id)

        return self._to_response(task)

    def delete(self, task_id: int, actor_id: str | None = None) -> None:
        task = task_repo.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError()
        if task.project.is_archived:
            raise ProjectArchivedError()
        task_repo.soft_delete(task)
        activity_repo.append(task.id, "deleted", old_value=None, new_value=None, actor_id=actor_id)

    def transition(self, task_id: int, data: TaskTransitionRequest, actor_id: str | None = None) -> TaskResponse:
        task = task_repo.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError()
        if task.project.is_archived:
            raise ProjectArchivedError()

        current = task.status
        to_status = data.to

        # FSM validation
        apply_transition(current, to_status)

        # Invariant: cannot go to done while subtasks incomplete
        if to_status == "done":
            incomplete_count = task.subtasks.filter(Subtask.status != "done").count()
            if incomplete_count > 0:
                raise SubtasksIncompleteError()

        # Dependency gate: cannot start if blocked by incomplete deps
        if to_status == "in_progress":
            blocking_ids = dependency_repo.list_blocked_by(task.id)
            blocking_tasks = []
            for dep_id in blocking_ids:
                dep_task = task_repo.get_by_id(dep_id)
                if dep_task and dep_task.status != "done":
                    blocking_tasks.append(
                        {"id": dep_task.id, "title": dep_task.title, "status": dep_task.status}
                    )
            if blocking_tasks:
                raise DependencyBlockedError(
                    "Task is blocked by unresolved dependencies.",
                    blocking_tasks=blocking_tasks,
                )

        task_repo.update(task, status=to_status)
        activity_repo.append(task.id, "status", old_value=current, new_value=to_status, actor_id=actor_id)
        return self._to_response(task)

    def _to_response(self, task) -> TaskResponse:
        priority = task.priority.value if hasattr(task.priority, "value") else str(task.priority)
        return TaskResponse(
            id=task.id,
            project_id=task.project_id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=priority,
            due_date=task.due_date,
            assignee_id=task.assignee_id,
            is_overdue=task.is_overdue,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )


task_service = TaskService()

