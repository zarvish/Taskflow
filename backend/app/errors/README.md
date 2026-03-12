# Error handling (module-based)

Errors are **domain-based**: each area of the app has its own codes and exceptions, and registers HTTP status with a central registry. This keeps the codebase scalable — new domains don’t touch existing files.

## Layout

- **`base.py`** — `AppError`, `build_error_payload()`, `code_value()`. No domain-specific codes.
- **`registry.py`** — Single `error_registry`: maps error code (string) → HTTP status. Domains register on import.
- **`handlers.py`** — Flask error handlers; use `error_registry.get_status(e.code)` and `build_error_payload()`.
- **`domains/`** — One module per domain:
  - **`task.py`** — `TaskErrorCode`, `TaskNotFoundError`, `InvalidTransitionError`, etc.
  - **`project.py`** — `ProjectErrorCode`, `ProjectNotFoundError`, `ProjectArchivedError`.
  - **`common.py`** — `CommonErrorCode` (validation, internal, workspace not-found), `NotFoundError`.
  - **`ai.py`** — `AIErrorCode`, `AIServiceError`.

## Adding a new domain (e.g. `tags`)

1. Create **`domains/tags.py`**:
   - Define `TagErrorCode(str, Enum)` with your codes.
   - Call `error_registry.register_many({ TagErrorCode.X: 404, ... })`.

2. In **`app/errors/domains/__init__.py`**:
   - Add `from app.errors.domains import tags as _tags`.
   - Re-export the new code enum and exception classes in `__all__`.

No changes needed in `handlers.py` or `base.py` — the handler already uses the registry and payload builder for any `AppError`.
