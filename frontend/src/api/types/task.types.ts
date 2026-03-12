export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  assignee_id: string | null;
  is_overdue: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string;
  assignee_id?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: Priority;
  due_date?: string;
  assignee_id?: string;
}

export interface TaskTransitionRequest {
  to: TaskStatus;
}

export interface TaskListResponse {
  tasks: Task[];
}
