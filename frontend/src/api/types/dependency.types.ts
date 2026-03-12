export interface DependencyEdge {
  id: number;
  task_id: number;
  depends_on_task_id: number;
  created_at: string;
}

export interface DependencyCreate {
  depends_on: number;
}

export interface DependenciesResponse {
  blocked_by: DependencyEdge[];
  blocking: DependencyEdge[];
}
