"""Activity log response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel,field_serializer


class ActivityLogResponse(BaseModel):
    id: int
    task_id: int
    actor_id: Optional[str] = None
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
    @field_serializer("created_at")
    def serialize_created_at(self, value: Optional[datetime]):
        if value is None:
            return None
        return value.isoformat()


class ActivityLogListResponse(BaseModel):
    activity: list[ActivityLogResponse]

