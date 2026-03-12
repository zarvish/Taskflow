"""Shared schema types (status, priority, pagination)."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

TaskStatusSchema = Literal[
    "backlog", "todo", "in_progress", "in_review", "done", "cancelled"
]
PrioritySchema = Literal["low", "medium", "high", "urgent"]
