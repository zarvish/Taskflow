"""Project request/response schemas."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.models.project import ProjectStatus


class ProjectCreate(BaseModel):
    workspace_id: int
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, max_length=32)
    icon: Optional[str] = Field(None, max_length=32)


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, max_length=32)
    icon: Optional[str] = Field(None, max_length=32)
    status: Optional[Literal["active", "archived"]] = None


class ProjectResponse(BaseModel):
    id: int
    workspace_id: int
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    status: str
    owner_id: Optional[str] = None

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]
