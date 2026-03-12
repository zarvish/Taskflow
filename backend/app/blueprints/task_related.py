"""Task-related routes: subtasks, dependencies, activity."""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.repositories.activity_repo import activity_repo
from app.schemas.activity import ActivityLogResponse
from app.schemas.dependency import DependencyCreate, DependencyEdge
from app.schemas.subtask import SubtaskCreate, SubtaskUpdate
from app.services.dependency_service import dependency_service
from app.services.subtask_service import subtask_service

task_related_bp = Blueprint("task_related", __name__, url_prefix="/api")


@task_related_bp.route("/tasks/<int:task_id>/subtasks", methods=["GET"])
def list_subtasks(task_id: int):
    subtasks = subtask_service.list(task_id)
    return jsonify({"subtasks": [s.model_dump() for s in subtasks]}), 200


@task_related_bp.route("/tasks/<int:task_id>/subtasks", methods=["POST"])
def create_subtask(task_id: int):
    data = SubtaskCreate.model_validate_json(request.data or b"{}")
    subtask = subtask_service.create(task_id, data)
    return jsonify(subtask.model_dump()), 201
@task_related_bp.route("/tasks/<int:task_id>/subtasks/<int:subtask_id>", methods=["PATCH"])
def update_subtask(task_id: int, subtask_id: int):
    data = SubtaskUpdate.model_validate_json(request.data or b"{}")
    subtask = subtask_service.update(task_id, subtask_id, data)
    return jsonify(subtask.model_dump()), 200
@task_related_bp.route("/tasks/<int:task_id>/subtasks/<int:subtask_id>", methods=["DELETE"])
def delete_subtask(task_id: int, subtask_id: int):
    subtask_service.delete(task_id, subtask_id)
    return ("", 204)




@task_related_bp.route("/tasks/<int:task_id>/dependencies", methods=["GET"])
def get_dependencies(task_id: int):
    blocked_by, blocking = dependency_service.list(task_id)
    return (
        jsonify(
            {
                "blocked_by": [DependencyEdge.model_validate(d).model_dump() for d in blocked_by],
                "blocking": [DependencyEdge.model_validate(d).model_dump() for d in blocking],
            }
        ),
        200,
    )


@task_related_bp.route("/tasks/<int:task_id>/dependencies", methods=["POST"])
def add_dependency(task_id: int):
    data = DependencyCreate.model_validate_json(request.data or b"{}")
    dep = dependency_service.add(task_id, data.depends_on)
    return jsonify(DependencyEdge.model_validate(dep).model_dump()), 201


@task_related_bp.route("/tasks/<int:task_id>/dependencies/<int:dep_id>", methods=["DELETE"])
def delete_dependency(task_id: int, dep_id: int):
    # task_id is included for URL shape consistency; dep_id is authoritative.
    dependency_service.delete(dep_id)
    return ("", 204)


@task_related_bp.route("/tasks/<int:task_id>/activity", methods=["GET"])
def list_activity(task_id: int):
    activity = activity_repo.list_by_task(task_id, limit=200)
    return (
        jsonify(
            {"activity": [ActivityLogResponse.model_validate(a).model_dump() for a in activity]}
        ),
        200,
    )

