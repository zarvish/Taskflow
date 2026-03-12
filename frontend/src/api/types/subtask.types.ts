export interface Subtask {
  id: number;
  parent_task_id: number;
  title: string;
  description: string | null;
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
  completed: boolean;
  created_at: string | null;
}

export interface SubtaskCreate {
  title: string;
  description?: string;
}

export interface SubtaskListResponse {
  subtasks: Subtask[];
}
