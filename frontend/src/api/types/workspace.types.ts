export interface Workspace {
  id: number;
  name: string;
  description?: string | null;
  owner_id?: string | null;
}

export interface WorkspaceCreate {
  name: string;
  description?: string;
}

export interface WorkspaceUpdate {
  name?: string;
  description?: string;
}

export interface WorkspaceListResponse {
  workspaces: Workspace[];
}
