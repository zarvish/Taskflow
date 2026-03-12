# TaskFlow Frontend

A modern, premium React-based task management frontend built with TypeScript, featuring FSM-aware task transitions, real-time updates, and a clean Kanban interface.

## 🏗️ Architecture Overview

### Technology Stack

- **React 18** + **TypeScript** - Type-safe component development
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **TanStack Query (React Query)** - Server state management, caching, and synchronization
- **Zustand** - Minimal client state management (UI preferences)
- **Tailwind CSS v3** - Utility-first styling
- **Axios** - HTTP client with interceptors
- **Lucide React** - Premium icon library
- **date-fns** - Date manipulation

### Project Structure

```
frontend/src/
├── api/                      # API Layer - Separated by domain
│   ├── client.ts            # Axios instance with interceptors
│   ├── projects.api.ts      # Project endpoints
│   ├── tasks.api.ts         # Task endpoints
│   ├── subtasks.api.ts
│   ├── comments.api.ts
│   ├── dependencies.api.ts
│   ├── activity.api.ts
│   └── types/               # TypeScript types for API responses
│       ├── common.types.ts
│       ├── project.types.ts
│       ├── task.types.ts
│       └── ...
│
├── components/              # Reusable UI components
│   └── ui/                 # Base UI components (shadcn-style)
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── Input.tsx
│
├── features/                # Feature modules (domain-driven)
│   ├── projects/
│   │   ├── hooks/          # React Query hooks
│   │   │   └── useProjects.ts
│   │   └── pages/          # Page components
│   │       ├── ProjectsPage.tsx
│   │       └── ProjectDetailPage.tsx
│   │
│   └── tasks/
│       ├── hooks/
│       │   └── useTasks.ts
│       └── utils/
│           └── fsm.ts       # FSM logic (mirrors backend)
│
├── store/                   # Zustand stores (client state only)
│   ├── ui.store.ts         # UI state (modals, theme, view mode)
│   └── filters.store.ts    # Filter preferences
│
├── utils/                   # Utility functions
│   ├── cn.ts               # className utility (clsx + tailwind-merge)
│   ├── constants.ts        # App constants
│   └── date.ts             # Date formatting utilities
│
├── App.tsx                  # Root component with routing
├── main.tsx                 # Entry point with providers
└── index.css                # Global styles + Tailwind

```

## 🎯 Key Design Principles

### 1. **Separation of Concerns**

- **API Layer**: All HTTP requests isolated in domain-specific files
- **Hooks**: React Query hooks separate from components
- **UI Components**: Reusable, styled with Tailwind
- **State**: Server state (React Query) vs Client state (Zustand)

### 2. **Type Safety**

- Full TypeScript coverage
- API types mirror backend Pydantic schemas
- Type-only imports for better tree-shaking

### 3. **FSM-Aware UI**

```typescript
// Client-side FSM validation mirrors backend
import { getValidTransitions, canTransition } from '@/features/tasks/utils/fsm';

// Only show valid transition buttons
const validNextStates = getValidTransitions(task.status);
```

### 4. **Interceptor Pattern**

```typescript
// Request interceptor - adds request ID for tracing
apiClient.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = crypto.randomUUID();
  return config;
});

// Response interceptor - structured error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const structuredError = {
      error: error.response?.data?.error || 'UNKNOWN_ERROR',
      message: error.response?.data?.message,
      request_id: error.config?.headers?.['X-Request-ID']
    };
    return Promise.reject(structuredError);
  }
);
```

### 5. **React Query Best Practices**

- **Query Keys**: Hierarchical structure (`['tasks', projectId]`)
- **Optimistic Updates**: setQueryData for immediate UI feedback
- **Cache Invalidation**: Strategic invalidation after mutations
- **Stale Time**: 30 seconds to reduce unnecessary refetches

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 22+
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Update .env with your API URL
VITE_API_BASE_URL=http://localhost:5000
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173` (or next available port).

## 🎨 Features Implemented

### ✅ Core Features

- **Project Management**
  - List all projects
  - View project details
  - Project status badges (active/archived)

- **Kanban Board**
  - Visual task board with 5 columns (Backlog → Todo → In Progress → In Review → Done)
  - Task cards with priority badges
  - Overdue task indicators
  - Task counts per column

- **Task Management**
  - Task listing by project
  - Priority visualization (Low, Medium, High, Urgent)
  - Due date display
  - Status-based grouping

- **FSM Integration**
  - Client-side FSM validation
  - Valid transition detection
  - Matches backend state machine exactly

- **Statistics Dashboard**
  - Total tasks count
  - Completion metrics
  - Tasks by status
  - Completion percentage

### 🎯 Technical Features

- **React Query Integration**
  - Automatic caching and background refetching
  - Optimistic updates
  - Query invalidation strategies
  - DevTools integration

- **Zustand State Management**
  - UI preferences persistence
  - Filter state
  - Modal state management

- **Responsive Design**
  - Mobile-first approach
  - Horizontal scroll on mobile for Kanban
  - Responsive grid layouts

- **Loading States**
  - Skeleton screens
  - Spinner animations
  - Empty state handling

- **Error Handling**
  - Structured error responses
  - User-friendly error messages
  - Request ID tracking

## 🔧 Configuration

### Path Aliases

```typescript
// tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage:
```typescript
import { Button } from '@/components/ui/Button';
import { useTasks } from '@/features/tasks/hooks/useTasks';
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000  # Backend API URL
```

## 📝 Code Style

### Component Pattern

```typescript
// Feature page component
export default function ProjectsPage() {
  // 1. State and hooks
  const workspaceId = useFiltersStore((state) => state.currentWorkspaceId);
  const { data, isLoading, error } = useProjects(workspaceId);

  // 2. Early returns (loading, error states)
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;

  // 3. Main render
  return <div>...</div>;
}
```

### API Hook Pattern

```typescript
export const useTasks = (projectId: number) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksApi.list(projectId).then(res => res.data.tasks),
    enabled: !!projectId,
  });
};
```

## 🧪 Testing Strategy

### Manual Testing Checklist

- [ ] Projects list loads correctly
- [ ] Project detail shows Kanban board
- [ ] Tasks grouped by status correctly
- [ ] Priority badges display proper colors
- [ ] Overdue tasks show warning badge
- [ ] Statistics calculate correctly
- [ ] Navigation works between pages
- [ ] Loading states display properly
- [ ] Error states handle API failures

## 🚧 Future Enhancements

### High Priority
- **Task Creation**: Form with validation (React Hook Form + Zod)
- **Task Editing**: Modal/drawer with inline editing
- **Status Transitions**: Drag-and-drop with FSM validation
- **Task Detail View**: Sidebar/modal with tabs (Details, Subtasks, Comments, Activity, Dependencies)

### Medium Priority
- **Subtasks Management**: Nested task view with completion tracking
- **Comments System**: Markdown-supported comments with timestamps
- **Dependencies Visualization**: Dependency graph with blocked indicators
- **Activity Timeline**: Audit log visualization
- **Search & Filters**: Filter by status, priority, assignee, tags
- **Keyboard Shortcuts**: Quick navigation and actions

### Low Priority
- **Dark Mode**: Toggle with system preference detection
- **AI Features**: Priority suggestions, task summaries, weekly digests
- **Real-time Updates**: WebSocket integration for collaborative editing
- **Notifications**: Toast notifications for mutations
- **Drag & Drop**: @dnd-kit integration for Kanban
- **Animations**: Framer Motion for smooth transitions

## 🛠️ Development Notes

### Why React Query?

- Eliminates boilerplate for data fetching
- Automatic caching and deduplication
- Background refetching keeps data fresh
- Optimistic updates for better UX
- Built-in loading and error states

### Why Zustand over Redux?

- Minimal boilerplate
- No providers needed
- Better TypeScript support
- Smaller bundle size
- Perfect for simple UI state

### Why Tailwind CSS?

- Utility-first approach speeds development
- Consistent design tokens
- No CSS file management
- Tree-shaking removes unused styles
- Great with component libraries

## 📚 Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/)

## 📄 License

Built for TaskFlow assignment - demonstrating production-ready React architecture with best practices.
