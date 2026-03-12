"""Workspace request/response schemas."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class WorkspaceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    owner_id: Optional[str] = None

    model_config = {"from_attributes": True}


class WorkspaceListResponse(BaseModel):
    workspaces: list[WorkspaceResponse]
