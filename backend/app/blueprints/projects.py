"""Project API routes."""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.project_service import project_service

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")


@projects_bp.route("", methods=["GET"])
def list_projects():
    workspace_id = request.args.get("workspace_id", type=int)
    if workspace_id is None:
        # Keep API explicit; clients must scope by workspace for now.
        return jsonify({"projects": []}), 200
    projects = project_service.list(workspace_id)
    return jsonify({"projects": [p.model_dump() for p in projects]}), 200


@projects_bp.route("", methods=["POST"])
def create_project():
    data = ProjectCreate.model_validate_json(request.data or b"{}")
    project = project_service.create(data)
    return jsonify(project.model_dump()), 201


@projects_bp.route("/<int:project_id>", methods=["GET"])
def get_project(project_id: int):
    project = project_service.get(project_id)
    return jsonify(project.model_dump()), 200


@projects_bp.route("/<int:project_id>", methods=["PATCH"])
def update_project(project_id: int):
    data = ProjectUpdate.model_validate_json(request.data or b"{}")
    project = project_service.update(project_id, data)
    return jsonify(project.model_dump()), 200


@projects_bp.route("/<int:project_id>", methods=["DELETE"])
def delete_project(project_id: int):
    project_service.delete(project_id)
    return ("", 204)

