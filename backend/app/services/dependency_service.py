"""Dependency service — cycle detection and invariants."""
from __future__ import annotations

from collections import deque

from app.errors.domains.task import CircularDependencyError, TaskNotFoundError
from app.repositories.dependency_repo import dependency_repo
from app.repositories.task_repo import task_repo


class DependencyService:
    def list(self, task_id: int):
        task = task_repo.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError()
        blocked_by = task.depends_on_tasks.order_by("id").all()
        blocking = task.blocking_deps.order_by("id").all()
        return blocked_by, blocking

    def add(self, task_id: int, depends_on_task_id: int):
        if task_id == depends_on_task_id:
            raise CircularDependencyError("Task cannot depend on itself.", cycle=[str(task_id)])

        task = task_repo.get_by_id(task_id)
        other = task_repo.get_by_id(depends_on_task_id)
        if not task or not other:
            raise TaskNotFoundError()
        if task.project_id != other.project_id:
            raise CircularDependencyError(
                "Cross-project dependencies are not supported.",
                cycle=[str(task_id), str(depends_on_task_id)],
            )

        if dependency_repo.get(task_id, depends_on_task_id):
            # Idempotent add
            return dependency_repo.get(task_id, depends_on_task_id)

        # Cycle detection: if task is reachable from depends_on_task_id, adding edge creates cycle.
        if self._is_reachable(start_id=depends_on_task_id, target_id=task_id):
            raise CircularDependencyError(
                "Adding this dependency would create a cycle.",
                cycle=[str(task_id), str(depends_on_task_id), str(task_id)],
            )

        return dependency_repo.add(task_id, depends_on_task_id)

    def delete(self, dep_id: int):
        dep = dependency_repo.get_by_id(dep_id)
        if not dep:
            return
        dependency_repo.delete(dep)

    def _is_reachable(self, start_id: int, target_id: int) -> bool:
        """Return True if target_id is reachable from start_id following depends-on edges."""
        seen: set[int] = set()
        q: deque[int] = deque([start_id])
        while q:
            current = q.popleft()
            if current == target_id:
                return True
            if current in seen:
                continue
            seen.add(current)
            for nxt in dependency_repo.list_blocked_by(current):
                if nxt not in seen:
                    q.append(nxt)
        return False


dependency_service = DependencyService()

