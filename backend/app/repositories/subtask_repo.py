"""Subtask repository — DB access only."""
from __future__ import annotations

from app.extensions import db
from app.models.subtask import Subtask


class SubtaskRepository:
    def list_by_task(self, task_id: int) -> list[Subtask]:
        return (
            Subtask.query.filter_by(task_id=task_id)
            .order_by(Subtask.created_at.asc())
            .all()
        )

    def create(self, task_id: int, title: str) -> Subtask:
        st = Subtask(task_id=task_id, title=title)
        db.session.add(st)
        db.session.commit()
        return st
    def update(self, subtask_id: int, status: str | None = None, title: str | None = None) -> Subtask | None:
        st = Subtask.query.get(subtask_id)
        if not st:
            return None
        if status is not None:
            st.status = status
        if title is not None:
            st.title = title
        db.session.commit()
        return st
    def delete(self, subtask_id: int) -> bool:
        st = Subtask.query.get(subtask_id)
        if not st:
            return False
        db.session.delete(st)
        db.session.commit()
        return True


subtask_repo = SubtaskRepository()

