import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '@/api/workspaces.api';
import type { WorkspaceCreate } from '@/api/types/workspace.types';

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspacesApi.list().then((res) => res.data.workspaces),
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WorkspaceCreate) =>
      workspacesApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};
export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: number) => workspacesApi.delete(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};
