"""Subtask request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SubtaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=512)


class SubtaskUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None


class SubtaskResponse(BaseModel):
    id: int
    task_id: int
    title: str
    status: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SubtaskListResponse(BaseModel):
    subtasks: list[SubtaskResponse]

