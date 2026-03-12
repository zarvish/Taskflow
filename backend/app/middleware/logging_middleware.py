"""Structured request/response logging with request_id and duration."""
from __future__ import annotations

import logging
import time
from flask import Flask, g, request

logger = logging.getLogger(__name__)


def init_logging_middleware(flask_app: Flask) -> None:
    """Register after_request to log request summary with request_id and duration."""

    @flask_app.before_request
    def record_start_time() -> None:
        g._request_start = time.perf_counter()

    @flask_app.after_request
    def log_request(response):
        duration_ms = 0.0
        if hasattr(g, "_request_start"):
            duration_ms = (time.perf_counter() - g._request_start) * 1000
        request_id = getattr(g, "request_id", None)
        logger.info(
            "request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.path,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
            },
        )
        return response
