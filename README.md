# TaskFlow — AI-Powered Task Management System

TaskFlow is a modern, full-stack task management application designed for focus and simplicity. It features a robust FSM-based task state machine, real-time-like drag-and-drop Kanban boards, and multi-workspace support.

## Key Technical Decisions

### 1. FSM-based Task Transitions
Instead of allowing arbitrary status updates, TaskFlow uses a **Finite State Machine (FSM)** on the backend. Transitions like `To Do -> Done` are explicitly defined, and domain rules (e.g., "cannot complete a task if it has open subtasks") are enforced at the transition layer. This ensures system integrity and prevents invalid states.

### 2. Service-Repository Pattern (Backend)
The backend follows a strict **Service-Repository architecture**. Blueprints handle HTTP concerns, Services handle business logic and FSM transitions, and Repositories handle database interactions. This separation of concerns makes the codebase highly testable and resilient to change.

### 3. TanStack Query for State Management
TaskFlow leverages **React Query** for all server-state management. This provides out-of-the-box caching, optimistic updates (used in Kanban drag-and-drop), and automatic background synchronization, ensuring a snappy and reliable UI.

### 4. Schema-First Development
Using **Pydantic** on the backend and **Zod** (via Type-sharing mindset) ensures that all data entering or leaving the system is validated. This "Interface Safety" prevents runtime errors caused by malformed data.

### 5. Database Architecture
The system uses a highly relational PostgreSQL schema:
- **Hierarchical**: Workspaces -> Projects -> Tasks -> Subtasks.
- **Many-to-Many**: Tasks manage dependencies between each other within a project.
- **Audit-ready**: An append-only `activity_logs` table tracks every transition.

## Tech Stack

- **Backend**: Python (Flask), SQLAlchemy, Alembic, Pydantic v2.
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI, TanStack Query.
- **Infrastructure**: Docker & Docker Compose (Production-ready Nginx setup).

## Getting Started

1. Convert all `.env.example` files into `.env` files (found in the root, backend, and frontend directories). The project is pre-configured and will work immediately.
2. Start the services:
   ```bash
   docker compose up -d --build
   ```
3. Run database migrations:
   ```bash
   docker compose exec backend flask db upgrade
   ```
4. Access the application:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5001`
   - **Health Check**: `http://localhost:5001/health`



## Walkthrough Video

A detailed technical walkthrough of the architecture, implementation details, and AI-assisted development workflow can be found here:

**[Assignment Walkthrough Video]
https://drive.google.com/file/d/1VYgVzVHUMZ3mfx02s0c0d3NCr2DqaH53/view?usp=sharing

## Additional Documentation

More detailed documentation for each service can be found in the following files:

- **Walkthrough Documentation:** [WALKTHROUGH.md](WALKTHROUGH.md)
- **AI Guidance Documentation:** [agents.md](agents.md)

These documents include service-specific setup instructions and implementation details.
