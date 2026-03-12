import { apiClient } from './client';
import type {
  Workspace,
  WorkspaceCreate,
  WorkspaceUpdate,
  WorkspaceListResponse,
} from './types/workspace.types';

export const workspacesApi = {
  list: () =>
    apiClient.get<WorkspaceListResponse>('/api/workspaces'),

  get: (workspaceId: number) =>
    apiClient.get<Workspace>(`/api/workspaces/${workspaceId}`),

  create: (data: WorkspaceCreate) =>
    apiClient.post<Workspace>('/api/workspaces', data),

  update: (workspaceId: number, data: WorkspaceUpdate) =>
    apiClient.patch<Workspace>(`/api/workspaces/${workspaceId}`, data),

  delete: (workspaceId: number) =>
    apiClient.delete(`/api/workspaces/${workspaceId}`),
};
