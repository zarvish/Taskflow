"""Assign request_id to each request and add to response headers."""
from __future__ import annotations

import uuid
from flask import Flask, g, request


def init_request_id_middleware(flask_app: Flask) -> None:
    """Register before/after request handlers for request_id."""

    @flask_app.before_request
    def set_request_id() -> None:
        g.request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

    @flask_app.after_request
    def add_request_id_header(response):
        if hasattr(g, "request_id"):
            response.headers["X-Request-ID"] = g.request_id
        return response
