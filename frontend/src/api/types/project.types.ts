export interface Project {
  id: number;
  workspace_id: number;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  status: 'active' | 'archived';
  owner_id: string | null;
}

export interface ProjectCreate {
  workspace_id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: 'active' | 'archived';
}

export interface ProjectListResponse {
  projects: Project[];
}
