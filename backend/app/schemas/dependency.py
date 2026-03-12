"""Dependency request/response schemas."""
from __future__ import annotations

from pydantic import BaseModel, Field


class DependencyCreate(BaseModel):
    depends_on: int = Field(..., gt=0)


class DependencyEdge(BaseModel):
    id: int
    task_id: int
    depends_on_task_id: int

    model_config = {"from_attributes": True}


class TaskDependenciesResponse(BaseModel):
    blocked_by: list[DependencyEdge]
    blocking: list[DependencyEdge]

