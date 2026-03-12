"""Global exception handlers — register on Flask app for centralized error responses."""
from __future__ import annotations

import logging
from typing import Optional

from flask import Flask, g, jsonify

from .base import AppError, build_error_payload, code_value
from .registry import error_registry
from .domains.common import CommonErrorCode

logger = logging.getLogger(__name__)


def get_request_id() -> Optional[str]:
    """Get current request ID from g (set by middleware)."""
    return getattr(g, "request_id", None)


def handle_app_error(e: AppError) -> tuple[dict, int]:
    """Convert AppError to JSON response with correct status from registry."""
    request_id = get_request_id()
    payload = build_error_payload(
        e.code, e.message, request_id=request_id, details=e.details or None
    )
    status = error_registry.get_status(e.code, default=400)
    logger.warning(
        "AppError",
        extra={
            "request_id": request_id,
            "error_code": code_value(e.code),
            "err_msg": e.message,
            "details": e.details,
        },
    )
    return jsonify(payload), status


def handle_validation_error(e: Exception) -> tuple[dict, int]:
    """Handle Pydantic or request validation errors."""
    request_id = get_request_id()
    message = str(e) if str(e) else "Validation failed."
    payload = build_error_payload(
        CommonErrorCode.VALIDATION_ERROR, message, request_id=request_id
    )
    return jsonify(payload), 422


def handle_generic_error(e: Exception) -> tuple[dict, int]:
    """Fallback for unhandled exceptions."""
    request_id = get_request_id()
    logger.exception(
        "Unhandled exception",
        extra={"request_id": request_id},
    )
    payload = build_error_payload(
        CommonErrorCode.INTERNAL_ERROR,
        "An unexpected error occurred.",
        request_id=request_id,
    )
    return jsonify(payload), 500


def register_error_handlers(app: Flask) -> None:
    """Register all error handlers on the Flask app."""
    from .base import AppError

    app.register_error_handler(AppError, lambda e: handle_app_error(e))
    app.register_error_handler(500, lambda e: handle_generic_error(e))
    try:
        from pydantic import ValidationError
        app.register_error_handler(ValidationError, handle_validation_error)
    except ImportError:
        pass
