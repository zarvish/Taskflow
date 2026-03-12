"""Health check endpoint — DB connectivity, uptime, version."""
from __future__ import annotations

import time
from flask import Blueprint, current_app
from flask import jsonify

health_bp = Blueprint("health", __name__, url_prefix="/health")

# Module load time as approximate start time
_start_time = time.time()


@health_bp.route("", methods=["GET"])
def health() -> tuple[dict, int]:
    """GET /health — returns db_ok, version, uptime_seconds."""
    db_ok = False
    try:
        from sqlalchemy import text
        from app.extensions import db
        db.session.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    uptime_seconds = round(time.time() - _start_time, 1)
    version = current_app.config.get("APP_VERSION", "0.0.0")

    payload = {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "version": version,
        "uptime_seconds": uptime_seconds,
    }
    status_code = 200 if db_ok else 503
    return jsonify(payload), status_code
