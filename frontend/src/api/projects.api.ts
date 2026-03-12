import { apiClient } from './client';
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectListResponse,
} from './types/project.types';

export const projectsApi = {
  // List projects by workspace
  list: (workspaceId: number) =>
    apiClient.get<ProjectListResponse>('/api/projects', {
      params: { workspace_id: workspaceId },
    }),

  // Get a single project
  get: (projectId: number) =>
    apiClient.get<Project>(`/api/projects/${projectId}`),

  // Create a new project
  create: (data: ProjectCreate) =>
    apiClient.post<Project>('/api/projects', data),

  // Update a project
  update: (projectId: number, data: ProjectUpdate) =>
    apiClient.patch<Project>(`/api/projects/${projectId}`, data),

  // Delete a project (soft delete)
  delete: (projectId: number) =>
    apiClient.delete(`/api/projects/${projectId}`),
};
