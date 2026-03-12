import { apiClient } from './client';
import type {
  Subtask,
  SubtaskCreate,
  SubtaskListResponse,
} from './types/subtask.types';

export const subtasksApi = {
  // List subtasks for a task
  list: (taskId: number) =>
    apiClient.get<SubtaskListResponse>(`/api/tasks/${taskId}/subtasks`),

  // Create a new subtask
  create: (taskId: number, data: SubtaskCreate) =>
    apiClient.post<Subtask>(`/api/tasks/${taskId}/subtasks`, data),

  // Update a subtask
  update: (taskId: number, subtaskId: number, data: { status?: string; title?: string }) =>
    apiClient.patch<Subtask>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, data),

  // Delete a subtask
  delete: (taskId: number, subtaskId: number) =>
    apiClient.delete(`/api/tasks/${taskId}/subtasks/${subtaskId}`),
};
