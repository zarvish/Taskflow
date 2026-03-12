"""Task request/response schemas."""
from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.common import PrioritySchema, TaskStatusSchema


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=512)
    description: Optional[str] = None
    priority: PrioritySchema = "medium"
    due_date: Optional[date] = None
    assignee_id: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=512)
    description: Optional[str] = None
    priority: Optional[PrioritySchema] = None
    due_date: Optional[date] = None
    assignee_id: Optional[str] = None
    # status is never updated via PATCH — use POST /tasks/:id/transition


class TaskTransitionRequest(BaseModel):
    to: TaskStatusSchema


class TaskResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[date] = None
    assignee_id: Optional[str] = None
    is_overdue: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
