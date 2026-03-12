import { apiClient } from './client';
import type {
  DependencyEdge,
  DependencyCreate,
  DependenciesResponse,
} from './types/dependency.types';

export const dependenciesApi = {
  // Get dependencies for a task (blocked_by and blocking)
  list: (taskId: number) =>
    apiClient.get<DependenciesResponse>(`/api/tasks/${taskId}/dependencies`),

  // Add a dependency (this task depends on another)
  create: (taskId: number, dependsOn: number) =>
    apiClient.post<DependencyEdge>(`/api/tasks/${taskId}/dependencies`, {
      depends_on: dependsOn,
    } as DependencyCreate),

  // Remove a dependency
  delete: (taskId: number, dependencyId: number) =>
    apiClient.delete(`/api/tasks/${taskId}/dependencies/${dependencyId}`),
};
