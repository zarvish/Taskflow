export interface ActivityLog {
  id: number;
  task_id: number;
  actor_id: string | null;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface ActivityLogListResponse {
  activity: ActivityLog[];
}
