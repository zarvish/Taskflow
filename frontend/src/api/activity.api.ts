import { apiClient } from './client';
import type { ActivityLogListResponse } from './types/activity.types';

export const activityApi = {
  // List activity logs for a task
  list: (taskId: number) =>
    apiClient.get<ActivityLogListResponse>(`/api/tasks/${taskId}/activity`),
};
