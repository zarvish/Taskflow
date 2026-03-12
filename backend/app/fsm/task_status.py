"""Task status FSM — single source of truth for allowed transitions."""
from __future__ import annotations

from enum import Enum
from typing import Set

from app.errors.domains.task import InvalidTransitionError

# Status values must match DB enum and API
class TaskStatus(str, Enum):
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
    CANCELLED = "cancelled"


# Exact transition table from requirements §6
ALLOWED_TRANSITIONS: dict[str, list[str]] = {
    TaskStatus.BACKLOG.value: [TaskStatus.TODO.value, TaskStatus.CANCELLED.value],
    TaskStatus.TODO.value: [TaskStatus.IN_PROGRESS.value, TaskStatus.CANCELLED.value],
    TaskStatus.IN_PROGRESS.value: [
        TaskStatus.TODO.value,
        TaskStatus.IN_REVIEW.value,
        TaskStatus.DONE.value,
        TaskStatus.CANCELLED.value,
    ],
    TaskStatus.IN_REVIEW.value: [
        TaskStatus.IN_PROGRESS.value,
        TaskStatus.DONE.value,
        TaskStatus.CANCELLED.value,
    ],
    TaskStatus.DONE.value: [],
    TaskStatus.CANCELLED.value: [],
}

TERMINAL_STATUSES: Set[str] = {TaskStatus.DONE.value, TaskStatus.CANCELLED.value}


def can_transition(from_status: str, to_status: str) -> bool:
    """Return True if transition from from_status to to_status is allowed."""
    allowed = ALLOWED_TRANSITIONS.get(from_status, [])
    return to_status in allowed


def apply_transition(current_status: str, to_status: str) -> None:
    """
    Validate transition; raise InvalidTransitionError if invalid.
    Does not mutate state — caller updates model and persists.
    """
    if current_status == to_status:
        raise InvalidTransitionError(
            "Task is already in that status.",
            from_status=current_status,
            to_status=to_status,
        )
    if current_status in TERMINAL_STATUSES:
        raise InvalidTransitionError(
            "Completed or cancelled tasks cannot transition.",
            from_status=current_status,
            to_status=to_status,
        )
    if not can_transition(current_status, to_status):
        raise InvalidTransitionError(
            f"Transition from {current_status} to {to_status} is not allowed.",
            from_status=current_status,
            to_status=to_status,
        )
