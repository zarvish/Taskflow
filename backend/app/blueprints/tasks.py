"""Task API routes."""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.schemas.task import TaskCreate, TaskTransitionRequest, TaskUpdate
from app.services.task_service import task_service

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api")


@tasks_bp.route("/projects/<int:project_id>/tasks", methods=["GET"])
def list_tasks(project_id: int):
    tasks = task_service.list_by_project(project_id)
    return jsonify({"tasks": [t.model_dump() for t in tasks]}), 200


@tasks_bp.route("/projects/<int:project_id>/tasks", methods=["POST"])
def create_task(project_id: int):
    data = TaskCreate.model_validate_json(request.data or b"{}")
    task = task_service.create(project_id, data)
    return jsonify(task.model_dump()), 201


@tasks_bp.route("/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id: int):
    task = task_service.get(task_id)
    return jsonify(task.model_dump()), 200


@tasks_bp.route("/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id: int):
    data = TaskUpdate.model_validate_json(request.data or b"{}")
    task = task_service.update(task_id, data)
    return jsonify(task.model_dump()), 200


@tasks_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id: int):
    task_service.delete(task_id)
    return ("", 204)


@tasks_bp.route("/tasks/<int:task_id>/transition", methods=["POST"])
def transition_task(task_id: int):
    data = TaskTransitionRequest.model_validate_json(request.data or b"{}")
    task = task_service.transition(task_id, data)
    return jsonify(task.model_dump()), 200

