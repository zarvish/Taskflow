"""Workspace API routes."""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate
from app.services.workspace_service import workspace_service, WorkspaceNotFoundError

workspaces_bp = Blueprint("workspaces", __name__, url_prefix="/api/workspaces")


@workspaces_bp.route("", methods=["GET"])
def list_workspaces():
    workspaces = workspace_service.list_all()
    return jsonify({"workspaces": [w.model_dump() for w in workspaces]}), 200


@workspaces_bp.route("", methods=["POST"])
def create_workspace():
    data = WorkspaceCreate.model_validate_json(request.data or b"{}")
    workspace = workspace_service.create(data)
    return jsonify(workspace.model_dump()), 201


@workspaces_bp.route("/<int:workspace_id>", methods=["GET"])
def get_workspace(workspace_id: int):
    workspace = workspace_service.get(workspace_id)
    return jsonify(workspace.model_dump()), 200


@workspaces_bp.route("/<int:workspace_id>", methods=["PATCH"])
def update_workspace(workspace_id: int):
    data = WorkspaceUpdate.model_validate_json(request.data or b"{}")
    workspace = workspace_service.update(workspace_id, data)
    return jsonify(workspace.model_dump()), 200


@workspaces_bp.route("/<int:workspace_id>", methods=["DELETE"])
def delete_workspace(workspace_id: int):
    workspace_service.delete(workspace_id)
    return ("", 204)
