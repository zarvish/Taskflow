"""Pydantic request/response schemas."""
from __future__ import annotations

from app.schemas.common import TaskStatusSchema, PrioritySchema
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
)
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskTransitionRequest,
)
from app.schemas.subtask import SubtaskCreate, SubtaskResponse, SubtaskListResponse
from app.schemas.dependency import DependencyCreate, DependencyEdge, TaskDependenciesResponse
from app.schemas.activity import ActivityLogResponse, ActivityLogListResponse

__all__ = [
    "TaskStatusSchema",
    "PrioritySchema",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "ProjectListResponse",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskListResponse",
    "TaskTransitionRequest",
    "SubtaskCreate",
    "SubtaskResponse",
    "SubtaskListResponse",
    "DependencyCreate",
    "DependencyEdge",
    "TaskDependenciesResponse",
    "ActivityLogResponse",
    "ActivityLogListResponse",
]
