import { apiClient } from './client';
import type {
  Comment,
  CommentCreate,
  CommentListResponse,
} from './types/comment.types';

export const commentsApi = {
  // List comments for a task
  list: (taskId: number) =>
    apiClient.get<CommentListResponse>(`/api/tasks/${taskId}/comments`),

  // Create a new comment
  create: (taskId: number, data: CommentCreate) =>
    apiClient.post<Comment>(`/api/tasks/${taskId}/comments`, data),
};
