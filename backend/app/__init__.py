"""Application factory — create and configure Flask app."""
from __future__ import annotations

from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate
from app.errors import register_error_handlers
from app.middleware import init_request_id_middleware, init_logging_middleware
from app.blueprints import health_bp, projects_bp, tasks_bp, task_related_bp, workspaces_bp


def create_app(config_object: type[Config] | None = None) -> Flask:
    """Create and configure the Flask application."""
    flask_app = Flask(__name__)

    if config_object is None:
        config_object = Config
    cfg = config_object()
    for key in dir(cfg):
        if key.isupper() and not key.startswith("_"):
            flask_app.config[key] = getattr(cfg, key)

    # Enable CORS for frontend
    CORS(flask_app, resources={r"/api/*": {"origins": "*"}})

    # Extensions
    db.init_app(flask_app)
    migrate.init_app(flask_app, db)
    with flask_app.app_context():
        import app.models  # noqa: F401 — register models with db.metadata for Alembic

    # Middleware
    init_request_id_middleware(flask_app)
    init_logging_middleware(flask_app)

    # Error handlers
    register_error_handlers(flask_app)

    # Blueprints
    flask_app.register_blueprint(health_bp)
    flask_app.register_blueprint(workspaces_bp)
    flask_app.register_blueprint(projects_bp)
    flask_app.register_blueprint(tasks_bp)
    flask_app.register_blueprint(task_related_bp)

    return flask_app
