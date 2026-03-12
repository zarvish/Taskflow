"""ActivityLog repository — append-only; no update/delete."""
from __future__ import annotations

from app.extensions import db
from app.models.activity_log import ActivityLog


class ActivityRepository:
    def append(
        self,
        task_id: int,
        field_name: str,
        old_value: str | None = None,
        new_value: str | None = None,
        actor_id: str | None = None,
    ) -> ActivityLog:
        entry = ActivityLog(
            task_id=task_id,
            actor_id=actor_id,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
        )
        db.session.add(entry)
        db.session.commit()
        return entry

    def list_by_task(self, task_id: int, limit: int = 100):
        return (
            ActivityLog.query.filter_by(task_id=task_id)
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
            .all()
        )


activity_repo = ActivityRepository()
