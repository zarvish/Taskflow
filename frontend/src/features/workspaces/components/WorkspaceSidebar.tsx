import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Briefcase, ChevronDown, Check, X, Layers, Trash2 } from 'lucide-react';
import { useWorkspaces, useCreateWorkspace, useDeleteWorkspace } from '@/features/workspaces/hooks/useWorkspaces';
import { useFiltersStore } from '@/store/filters.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Workspace } from '@/api/types/workspace.types';

export default function WorkspaceSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: workspaces, isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const currentWorkspaceId = useFiltersStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspaceId = useFiltersStore((s) => s.setCurrentWorkspaceId);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [expanded, setExpanded] = useState(true);

  // Auto-select first workspace if none selected
  const currentWs = workspaces?.find((w: Workspace) => w.id === currentWorkspaceId);

  const handleSelectWorkspace = (ws: Workspace) => {
    setCurrentWorkspaceId(ws.id);
    navigate('/projects');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const ws = await createWorkspace.mutateAsync({ name: newName.trim(), description: newDesc || undefined });
      setCurrentWorkspaceId(ws.id);
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      navigate('/projects');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWorkspace = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workspace? All projects and tasks within it will be hidden.')) {
      return;
    }
    try {
      await deleteWorkspace.mutateAsync(id);
      if (id === currentWorkspaceId) {
        setCurrentWorkspaceId(null);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r flex flex-col shrink-0">
      {/* App Logo */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">TaskFlow</span>
        </div>
      </div>

      {/* Workspace Section */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setExpanded((v) => !v)}
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? '' : '-rotate-90'}`} />
            Workspaces
          </button>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="New workspace"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Create Workspace Form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="mb-3 p-3 bg-accent rounded-lg space-y-2">
            <Input
              type="text"
              placeholder="Workspace name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-7 text-sm"
              autoFocus
            />
            <Input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="h-7 text-sm"
            />
            <div className="flex gap-1">
              <Button type="submit" size="sm" className="h-6 text-xs flex-1" disabled={createWorkspace.isPending}>
                <Check className="w-3 h-3" />
                {createWorkspace.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => { setShowCreate(false); setNewName(''); setNewDesc(''); }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </form>
        )}

        {/* Workspace List */}
        {expanded && (
          <div className="space-y-0.5">
            {isLoading ? (
              <div className="text-xs text-muted-foreground px-2 py-1 animate-pulse">Loading...</div>
            ) : !workspaces || workspaces.length === 0 ? (
              <div className="text-xs text-muted-foreground px-2 py-3 text-center">
                <p>No workspaces yet.</p>
                <button
                  className="text-primary underline mt-1"
                  onClick={() => setShowCreate(true)}
                >
                  Create one
                </button>
              </div>
            ) : (
              workspaces.map((ws: Workspace) => (
                <button
                  key={ws.id}
                  onClick={() => handleSelectWorkspace(ws)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors text-left ${
                    ws.id === currentWorkspaceId
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-accent'
                  } group`}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                    ws.id === currentWorkspaceId ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate flex-1">{ws.name}</span>
                  <button
                    onClick={(e) => handleDeleteWorkspace(e, ws.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                    title="Delete workspace"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </button>
              ))
            )}
          </div>
        )}

        {/* Current Workspace Nav */}
        {currentWs && (
          <div className="mt-6">
            <div className="px-1 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Navigation
            </div>
            <button
              onClick={() => navigate('/projects')}
              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors text-left ${
                location.pathname === '/projects' || location.pathname.startsWith('/projects/')
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              Projects
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {currentWs && (
        <div className="border-t px-3 py-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold shrink-0">
              {currentWs.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{currentWs.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {currentWs.description || 'No description'}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
