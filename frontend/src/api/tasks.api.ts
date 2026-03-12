import { apiClient } from './client';
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskTransitionRequest,
  TaskListResponse,
} from './types/task.types';

export const tasksApi = {
  // List tasks by project
  list: (projectId: number) =>
    apiClient.get<TaskListResponse>(`/api/projects/${projectId}/tasks`),

  // Get a single task
  get: (taskId: number) =>
    apiClient.get<Task>(`/api/tasks/${taskId}`),

  // Create a new task
  create: (projectId: number, data: TaskCreate) =>
    apiClient.post<Task>(`/api/projects/${projectId}/tasks`, data),

  // Update a task (does not update status)
  update: (taskId: number, data: TaskUpdate) =>
    apiClient.patch<Task>(`/api/tasks/${taskId}`, data),

  // Transition task status (FSM-aware)
  transition: (taskId: number, to: string) =>
    apiClient.post<Task>(`/api/tasks/${taskId}/transition`, { to } as TaskTransitionRequest),

  // Delete a task (soft delete)
  delete: (taskId: number) =>
    apiClient.delete(`/api/tasks/${taskId}`),
};
