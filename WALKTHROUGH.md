# TaskFlow — Submission Walkthrough

This document provides a deep dive into the technical architecture, design decisions, and evolution of the TaskFlow application.

## 1. Architecture & Structure

TaskFlow follows a **clean, layered architecture** both on the frontend and backend.

### Backend (Flask/SQLAlchemy)
- **Blueprints**: Entry points for HTTP requests. They handle request parsing and response formatting.
- **Services**: Contain the core business logic. This is where the State Machine (FSM) lives and where domain rules are enforced.
- **Repositories**: Abstract the data access layer (SQLAlchemy). This allows us to swap databases or mock them for testing easily.
- **Schemas (Pydantic)**: Ensure strict interface safety. Every data object moving through the service layer is validated.

### Frontend (React/TypeScript)
- **Features**: Organized by domain (`tasks`, `projects`, `workspaces`). Each folder contains its own components, hooks, and types.
- **API Wrapper**: A centralized `api/` layer using Axios, providing typings for all backend endpoints.
- **State Management**: 
  - **Server State**: Managed via TanStack Query for caching and synchronization.
  - **Client State**: Minimal use of Zustand for global filters (e.g., `currentWorkspaceId`).

### Database Architecture
TaskFlow uses a relational schema designed for scalability and auditability.

![alt text](<Untitled diagram-2026-03-12-111311.svg>)


## 2. Technical Decisions

### Finite State Machine (FSM)
To prevent tasks from reaching invalid states (e.g., moving directly from `To Do` to `Done` while subtasks are open), we implemented a central FSM. 
- **Benefit**: Simplifies frontend logic (the UI only shows valid buttons) and guarantees data integrity on the backend.

### Soft Deletion
Tasks, Projects, and Workspaces use a `deleted_at` timestamp rather than physical deletion.
- **Benefit**: Preservation of activity logs and easy recovery if a user accidentally deletes a project.

### Docker Integration
We used a **Docker-first development** approach.
- **Frontend**: Multi-stage build (Node for building, Nginx for serving) to optimize production image size.
- **Backend**: Python 3.12-slim base image for a lightweight, stable runtime environment.
- **Compose**: Orchestrates the services and database, ensuring a seamless "one-command" setup (`docker compose up`).

## 3. AI Usage & Guidance

This project was developed in collaboration with **Antigravity (Claude-based agent)**. 

- **Tools Used**: Antigravity for code generation, architectural planning, and debugging.
- **Prompting Strategy**: Used "Constraint-First" prompting. Before writing code, we defined the "Interface" (Pydantic/TS Types) to ensure the agent stayed within the lines.
- **Verification**: Every piece of AI-generated code was verified by running `npx tsc` and `pytest`. 

## 4. Scalability & Future-Proofing

### Auth-Ready Architecture
The system is designed with **multi-tenancy in mind**. While active session enforcement is deferred for the MVP, the database models (`Workspace`, `Project`, `Task`) and service layers are already equipped with `owner_id` and `actor_id` fields. This ensures that integrating a full-scale authentication provider (like JWT or Firebase) is a "plug-and-play" operation rather than a major refactor.

### Real-time & Collaboration
The Kanban board currently uses high-performance polling via **TanStack Query**. To scale for thousands of concurrent users in a high-velocity environment, the architecture is designed to easily swap the polling mechanism for **WebSockets (Socket.io)** while keeping the underlying services intact.

### AI Task Assistance
The service layer is built to be "Agent-Friendly". A future AI assistant could hook into the `TaskService` to automatically generate subtasks or descriptions based on team best practices, leveraging the structured activity logs for context.
