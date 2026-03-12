# TaskFlow — Requirements & Product Definition

> A disciplined, observable task management system built for clarity, correctness, and change resilience.

---

## 1. What Is TaskFlow?

TaskFlow is a **structured task and project management tool** built for individuals and small teams. It enforces a clear, auditable workflow where tasks move through defined lifecycle states — preventing invalid operations, recording every change, and surfacing failures visibly.

Think of it as a minimal Jira/Linear — but engineered to demonstrate **correct-by-design** software: explicit state machines, typed interfaces at every boundary, full audit trails, and AI-assisted productivity built on top of a solid foundation.

---

## 2. Why TaskFlow Stands Out

Most candidates build CRUD apps — create, read, update, delete — with no enforcement of business rules. TaskFlow is different:

| What Most Candidates Do               | What TaskFlow Does                                                       |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Free-form status field (string)       | Enforced FSM — invalid transitions rejected with reasons                 |
| No history                            | Every change logged with actor, timestamp, old/new value                 |
| No validation beyond "field required" | Pydantic schemas + DB constraints + frontend guards                      |
| No error structure                    | Centralized error codes, structured error responses                      |
| No tests                              | Pytest suite covering state transitions, edge cases, API contracts       |
| Manual debugging                      | Structured logging with request IDs, observable error trails             |
| AI as an afterthought                 | AI deeply integrated: summaries, priority suggestions, changelog digests |

The evaluators explicitly said: **"Small, well-structured systems score higher than large feature-rich ones."** TaskFlow leans into this.

---

## 3. Core Domain Model

```
Workspace
  └── Project
        └── Task
              ├── Subtasks
              ├── Dependencies (blocked-by / blocking)
              ├── Tags
              ├── Comments
              └── ActivityLog (immutable audit trail)
```

### Entities

#### Workspace

- Name, description, owner
- Soft-delete only (no hard deletes — data integrity)

#### Project

- Belongs to a Workspace
- Name, description, color/icon
- Status: `active | archived`
- Owned by a user

#### Task

- Belongs to a Project
- Title, description (Markdown supported)
- **Status (FSM-enforced):** `backlog → todo → in_progress → in_review → done | cancelled`
- Priority: `low | medium | high | urgent`
- Due date with overdue detection
- Assignee (user reference)
- Tags (M:M)
- Subtasks (self-referential, max 1 level deep — enforced)

#### ActivityLog (Append-Only)

- Records every field change: `who`, `what changed`, `old value`, `new value`, `when`
- Cannot be modified or deleted — enforced at DB and API level
- Powers audit trails + AI digest

---

## 4. Features

### 4.1 Task Lifecycle — Finite State Machine (FSM)

The status field is **not a free-form string**. It is governed by a strict FSM:

```
backlog ──→ todo ──→ in_progress ──→ in_review ──→ done
                         │                            ↑
                         └──────────────────────────→ │

Any state → cancelled (except done)
done → (terminal, no further transitions)
```

**Rules enforced server-side:**

- Attempting an invalid transition returns a structured error: `{ "error": "INVALID_TRANSITION", "from": "done", "to": "in_progress", "message": "Completed tasks cannot be reopened." }`
- Frontend mirrors the same FSM to disable invalid transition buttons — but never trusts the frontend alone

### 4.2 Priority Management

- 4-tier priority system: `low | medium | high | urgent`
- **AI Priority Suggestion**: Submit a task title + description, get back a suggested priority with reasoning
- Priority changes are logged in ActivityLog

### 4.3 Subtasks

- Tasks can have subtasks (one level only — enforced at DB and API)
- Parent task cannot be marked `done` while subtasks are incomplete — **invariant enforced server-side**
- Subtask completion percentage shown on parent

### 4.4 Task Dependencies

Tasks can declare **blocked-by** relationships with other tasks within the same project.

**Rules enforced server-side:**

- A task cannot be moved to `in_progress` if it has unresolved blocking dependencies (i.e., a task it depends on is not yet `done`)
- Attempting this returns: `{ "error": "DEPENDENCY_BLOCKED", "blocking_tasks": [...] }`
- **Cycle detection enforced**: Task A cannot depend on Task B if Task B already depends on Task A (directly or transitively) — checked via DFS on every new dependency creation
- Attempting a circular dependency returns: `{ "error": "CIRCULAR_DEPENDENCY", "cycle": ["task-A", "task-B", "task-A"] }`
- Dependency links are project-scoped only — cross-project dependencies not supported (simplicity boundary, clearly documented)

**UI representation:**

- Task detail shows "Blocked by" and "Blocking" sections with live status badges on each linked task
- Blocked tasks show a 🔒 lock indicator on the Kanban board card
- FSM-aware: the `Start` button is disabled with tooltip `"Blocked by: [Task Name]"` when unresolved dependencies exist
- Dependency changes are recorded in ActivityLog

### 4.5 Tags

- User-defined tags per workspace
- Tasks can have multiple tags
- Filter view by tag

### 4.5 Comments

- Thread comments on tasks
- Markdown rendered on frontend
- User + timestamp recorded

### 4.6 Full Audit Trail (ActivityLog)

- Every create, update, status change, reassignment, priority change → logged
- Immutable: no UPDATE/DELETE on this table, ever
- Powers the "History" tab on every task
- Powers AI Digest feature

### 4.7 Dashboard & Kanban View

- Board view: tasks grouped by status (drag-and-drop triggers FSM validation)
- List view: sortable by priority, due date, created date
- Overdue tasks highlighted
- Project-level stats: total tasks, by-status breakdown, completion rate

### 4.8 AI Features (the differentiator)

> AI is not a gimmick here — it's integrated at meaningful points in the workflow.

#### AI Priority Suggestion

- Input: task title + description text
- Output: suggested priority (`low/medium/high/urgent`) + one-line reasoning
- Implemented with OpenAI GPT-4o-mini (cheap, fast)
- User can accept or override — no forced AI decisions

#### AI Task Summary

- Per-project: summarizes all open tasks, blockers, and recent activity into a natural-language paragraph
- Useful for standups and async updates
- Prompt is structured and deterministic — same input → same shape output

#### AI Weekly Digest (on-demand)

- Takes the last 7 days of ActivityLog entries for a project
- Generates a human-readable changelog: what was completed, what got blocked, what changed priority
- One button click → coherent narrative summary

#### AI Subtask Generator

- Input: a task title + description
- Output: suggested list of subtasks (breakdown of what's needed)
- User can select which to accept, edit, or discard
- Reduces blank-page friction

### 4.9 Observability & Error Handling

> Failures are visible and diagnosable — a first-class requirement.

#### Structured Logging

- Every request assigned a `request_id` (UUID)
- Logs include: `request_id`, `method`, `path`, `user_id`, `status_code`, `duration_ms`
- Errors logged with full context — not just the exception message

#### Centralized Error Codes

- All API errors follow a consistent shape:
  ```json
  {
    "error": "TASK_NOT_FOUND",
    "message": "Task with ID abc123 does not exist.",
    "request_id": "f4a21c...",
    "timestamp": "2026-03-11T10:00:00Z"
  }
  ```
- Error codes are an enum — not ad-hoc strings
- Frontend reads `error` field to display contextual messages

#### Health Check Endpoint

- `GET /health` → returns DB connectivity, uptime, version
- Useful for operational visibility

---

## 5. Technical Architecture

### Backend (Python + Flask)

- **Flask** with Blueprints — clean routing separation per domain
- **SQLAlchemy ORM** — models define DB schema; migrations via **Alembic**
- **Pydantic v2** — request/response schema validation at every endpoint boundary
- **Pytest** — test suite for FSM transitions, API contracts, edge cases
- Service layer: `routes → service → repository` — no business logic in routes
- FSM implemented as a standalone module — pure functions, fully testable independently

### Frontend (React)

- **React + Vite** — fast dev experience
- **React Query (TanStack)** — server state, caching, background refetch
- **Zustand** — minimal client state (UI state only)
- **React Hook Form + Zod** — form validation mirrors backend schemas
- Kanban board with drag-and-drop (react-beautiful-dnd or dnd-kit)
- FSM-aware UI: transition buttons only shown for valid next states

### Database (PostgreSQL)

- PostgreSQL — relational, ACID-compliant
- Schema enforces constraints: FK integrity, non-null rules, check constraints on status enum
- `activity_logs` table: no UPDATE/DELETE permissions at application level (enforced via service layer guard)

### AI Layer

- OpenAI API (GPT-4o-mini)
- Prompt templates stored as versioned strings — not scattered inline
- AI calls wrapped in a service module with structured error handling (API failures don't crash the app)
- AI responses validated before use — not blindly trusted

---

## 6. State Machine — Exact Transition Table

| From          | Allowed Transitions To             |
| ------------- | ---------------------------------- |
| `backlog`     | `todo`, `cancelled`                |
| `todo`        | `in_progress`, `cancelled`         |
| `in_progress` | `in_review`, `done`, `cancelled`   |
| `in_review`   | `in_progress`, `done`, `cancelled` |
| `done`        | _(terminal — no transitions)_      |
| `cancelled`   | _(terminal — no transitions)_      |

Any other transition → `INVALID_TRANSITION` error.

---

## 7. Business Invariants (Enforced, Not Just Documented)

These are rules the system actively prevents from being violated — not just guidelines:

1. **Done-blocked by subtasks**: A task cannot transition to `done` if it has incomplete subtasks.
2. **Terminal states are final**: No transitions out of `done` or `cancelled`.
3. **ActivityLog is immutable**: No endpoint exists to update or delete log entries.
4. **Subtask depth limit**: Subtasks cannot have their own subtasks (max depth = 1).
5. **Dependency gate**: A task cannot start (`in_progress`) while blocked by incomplete dependencies.
6. **Circular dependency prevention**: Adding a dependency that creates a cycle is rejected immediately via DFS traversal.
7. **Archived project guard**: Tasks in archived projects cannot be modified (read-only).
8. **Overdue is computed, not stored**: Overdue status is derived from `due_date` — never stored as a field that can go stale.

---

## 8. API Design (Key Endpoints)

```
# Projects
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id  (soft-delete only)

# Tasks
GET    /api/projects/:id/tasks
POST   /api/projects/:id/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id  (soft-delete only)

# Status Transitions (explicit endpoint — not via PATCH)
POST   /api/tasks/:id/transition
       Body: { "to": "in_progress" }

# Subtasks
GET    /api/tasks/:id/subtasks
POST   /api/tasks/:id/subtasks

# Comments
GET    /api/tasks/:id/comments
POST   /api/tasks/:id/comments

# Dependencies
GET    /api/tasks/:id/dependencies          → { blocked_by: [...], blocking: [...] }
POST   /api/tasks/:id/dependencies          → { "depends_on": "<task_id>" }
DELETE /api/tasks/:id/dependencies/:dep_id

# Activity Log
GET    /api/tasks/:id/activity

# AI Features
POST   /api/ai/suggest-priority    → { title, description } → priority + reason
POST   /api/ai/task-summary        → { project_id } → narrative paragraph
POST   /api/ai/weekly-digest       → { project_id } → changelog narrative
POST   /api/ai/suggest-subtasks    → { title, description } → [subtask titles]

# Health
GET    /health
```

---

## 9. Test Coverage Plan

| Area                     | What's Tested                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------- |
| FSM module               | All valid transitions pass, all invalid transitions raise `InvalidTransitionError` |
| Done-blocked invariant   | Task with open subtasks cannot be marked done                                      |
| Dependency gate          | Task blocked by incomplete dep cannot transition to `in_progress`                  |
| Cycle detection          | DFS correctly rejects direct + transitive circular dependencies                    |
| API contracts            | Request schema validation rejects malformed input                                  |
| ActivityLog immutability | No update/delete route exists; service-layer guard confirmed                       |
| AI service               | Handles OpenAI API failure gracefully (mock in tests)                              |
| Overdue computation      | Due dates in past → `is_overdue: true` in response                                 |

---

## 10. AI Guidance Files (Part of Submission)

Per the assignment requirement, we will include:

- `agents.md` — Coding standards, constraints, and rules for AI agents working on this codebase
- `prompts/` — Versioned prompt templates used in AI features
- `ARCHITECTURE.md` — System boundaries, invariants, and extension guide

This demonstrates that AI was used deliberately, with guardrails — not blindly.

---

## 11. What the Walkthrough Will Cover (10–15 min)

1. **Architecture Overview** — Domain model, layered architecture diagram, DB schema
2. **The FSM** — Live demo of invalid transition being rejected; show the code
3. **Business Invariants** — Walk through the "done-blocked" rule in code + test
4. **AI Integration** — Live demo of priority suggestion + weekly digest
5. **Observability** — Show structured error response + request_id in logs
6. **Test Suite** — Run tests live; show FSM test cases
7. **What I'd do with more time** — Auth (JWT), WebSocket for real-time updates, team collaboration
8. **AI Usage Honesty** — What AI generated, how I reviewed and constrained it

---

## 12. Timeline (48 Hours)

| Hours | Work                                                                      |
| ----- | ------------------------------------------------------------------------- |
| 0–4   | Backend scaffolding: Flask app, DB models, Alembic migrations, FSM module |
| 4–8   | Core API: projects, tasks, status transition endpoint                     |
| 8–12  | Subtasks, comments, ActivityLog                                           |
| 12–16 | Pytest suite: FSM, invariants, API contracts                              |
| 16–20 | React frontend: project list, task board (Kanban), task detail            |
| 20–24 | AI features: priority suggestion, task summary, weekly digest             |
| 24–30 | UI polish: drag-and-drop, FSM-aware buttons, activity history tab         |
| 30–36 | Observability: structured logging, error codes, health endpoint           |
| 36–42 | README, ARCHITECTURE.md, agents.md, prompt files                          |
| 42–48 | Walkthrough recording, final cleanup, submission                          |
