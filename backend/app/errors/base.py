"""Base error types and payload builder — shared by all error domains."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional, Union

# Type for any error code enum (has .value)
ErrorCodeLike = Union[str, "HasErrorValue"]


class HasErrorValue:
    """Protocol: anything that has an error code string value (e.g. enum)."""
    value: str


def build_error_payload(
    code: ErrorCodeLike,
    message: str,
    request_id: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Build the standard error response body. Accepts enum or string code."""
    code_value = code.value if hasattr(code, "value") else code
    payload: dict[str, Any] = {
        "error": code_value,
        "message": message,
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
    }
    if request_id is not None:
        payload["request_id"] = request_id
    if details is not None:
        payload["details"] = details
    return payload


def code_value(code: ErrorCodeLike) -> str:
    """Normalize code to string value."""
    return code.value if hasattr(code, "value") else code


class AppError(Exception):
    """Base for all application errors that map to a structured API response."""

    def __init__(
        self,
        code: ErrorCodeLike,
        message: str,
        details: Optional[dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(message)
