"""Finite state machine and domain rules."""
from __future__ import annotations

from .task_status import (
    TaskStatus,
    ALLOWED_TRANSITIONS,
    can_transition,
    apply_transition,
)

__all__ = [
    "TaskStatus",
    "ALLOWED_TRANSITIONS",
    "can_transition",
    "apply_transition",
]
