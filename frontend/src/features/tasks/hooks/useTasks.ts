import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/api/tasks.api';
import type { TaskCreate, TaskUpdate } from '@/api/types/task.types';

export const useTasks = (projectId: number) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksApi.list(projectId).then((res) => res.data.tasks),
    enabled: !!projectId,
  });
};

export const useTask = (taskId: number) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.get(taskId).then((res) => res.data),
    enabled: !!taskId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: TaskCreate }) =>
      tasksApi.create(projectId, data).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) =>
      tasksApi.update(id, data).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['task', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
    },
  });
};

export const useTaskTransition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, to }: { taskId: number; to: string }) =>
      tasksApi.transition(taskId, to).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['task', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => tasksApi.delete(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.removeQueries({ queryKey: ['task', taskId] });
    },
  });
};
