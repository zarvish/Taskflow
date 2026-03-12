# AI Guidance & Development Standards

## Tools & Context

- **Primary AI**: Antigravity (Advanced Agentic AI from Google DeepMind), Mermaid Ai (for schema visualization), Chatgpt (for general AI tasks).
- **Model**: Powered by Claude 4.6 Sonnet.
- **Interactive Mode**: Pair-programming via terminal and filesystem access.

## Prompting Rules & Constraints

1. **Schema-First**: Always define the Pydantic schema (Backend) and TypeScript Interface (Frontend) before implementation. This prevents "hallucinated" data fields.
2. **Layered Logic**: Never put business logic in the Blueprint/Controller. It must go through the Service layer to ensure FSM rules are applied.
3. **No Placeholders**: AI is strictly forbidden from using `// TODO` or placeholder code. Every feature must be end-to-end functional.
4. **Type Safety**: `any` is a failure. All data must be typed.
5. **Atomic Edits**: Use small, focused tool calls to modify files rather than rewriting entire modules. This preserves manually written nuances.

## System Integrity Guards

- **Migration Compliance**: All DB changes must be accompanied by an Alembic migration.
- **FSM Constraints**: No status update can bypass the `transition` method.
- **Docker-First**: If a change doesn't work inside the container, it's considered broken.

## AI Review Checklist

- [x] Does this change break existing FSM transitions?
- [x] Are the new types reflected in both Python and TypeScript?
- [x] Is the error message user-friendly (Toast) or just a raw exception?
- [x] Does the Docker volume mapping correctly reflect the new files?
- [x] Does the database migration correctly reflect the model changes?
