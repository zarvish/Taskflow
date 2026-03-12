export interface Comment {
  id: number;
  task_id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

export interface CommentCreate {
  content: string;
  user_id: string;
}

export interface CommentListResponse {
  comments: Comment[];
}
