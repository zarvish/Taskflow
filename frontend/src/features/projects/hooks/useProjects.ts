import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects.api';
import type { ProjectCreate, ProjectUpdate } from '@/api/types/project.types';

export const useProjects = (workspaceId: number | null) => {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectsApi.list(workspaceId as number).then((res) => res.data.projects),
    enabled: !!workspaceId,
  });
};

export const useProject = (projectId: number) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.get(projectId).then((res) => res.data),
    enabled: !!projectId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', data.workspace_id] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectUpdate }) =>
      projectsApi.update(id, data).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['project', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['projects', data.workspace_id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => projectsApi.delete(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.removeQueries({ queryKey: ['project', projectId] });
    },
  });
};
