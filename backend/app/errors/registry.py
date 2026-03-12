"""Central registry of error code -> HTTP status. Domains register their codes here."""
from __future__ import annotations

from typing import Dict, Union

from .base import code_value

# Code can be enum member or string
CodeLike = Union[str, "HasErrorValue"]


class ErrorRegistry:
    """Maps error code values to HTTP status. Each domain registers its own codes."""

    def __init__(self) -> None:
        self._status_map: Dict[str, int] = {}

    def register(self, code: CodeLike, status: int) -> None:
        """Register a single code -> status."""
        self._status_map[code_value(code)] = status

    def register_many(self, mapping: Dict[CodeLike, int]) -> None:
        """Register multiple codes at once. mapping: { CodeEnum.MEMBER: 404, ... }."""
        for code, status in mapping.items():
            self.register(code, status)

    def get_status(self, code: CodeLike, default: int = 400) -> int:
        """Return HTTP status for this code."""
        return self._status_map.get(code_value(code), default)


# Global registry — domains import this and call register/register_many on app init or first import
error_registry = ErrorRegistry()
