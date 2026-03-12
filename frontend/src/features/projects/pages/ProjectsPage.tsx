import { Link } from 'react-router-dom';
import { Plus, Folder } from 'lucide-react';
import { useState } from 'react';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import { useFiltersStore } from '@/store/filters.store';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function ProjectsPage() {
  const workspaceId = useFiltersStore((state) => state.currentWorkspaceId);
  const { data: projects, isLoading, error } = useProjects(workspaceId);
  const createProject = useCreateProject();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      await createProject.mutateAsync({
        workspace_id: workspaceId as number,
        name: projectName,
        description: projectDescription || undefined,
        icon: '📁',
      });
      setProjectName('');
      setProjectDescription('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-destructive">
          <p>Error loading projects</p>
          <p className="text-sm text-muted-foreground mt-2">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage your projects and tasks</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} disabled={!workspaceId}>
          <Plus className="w-4 h-4 ml-[-4px] mr-2" />
          New Project
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        {!workspaceId ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No workspace selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select or create a workspace from the left sidebar to view projects.
            </p>
          </div>
        ) : (
          <>
            {/* Create Project Form */}
            {showCreateForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Project</CardTitle>
                  <CardDescription>Add a new project to organize your tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Name *</label>
                      <Input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter project name"
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Input
                        type="text"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="Enter project description (optional)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={createProject.isPending}>
                        {createProject.isPending ? 'Creating...' : 'Create Project'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setProjectName('');
                          setProjectDescription('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Projects in Workspace</h2>
              <p className="text-muted-foreground">
                {projects?.length || 0} project{projects?.length !== 1 ? 's' : ''}
              </p>
            </div>

            {!projects || projects.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                  Get started by creating your first project in this workspace.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2 ml-[-4px]" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {project.icon && <span className="text-lg">{project.icon}</span>}
                            <CardTitle className="text-base truncate">{project.name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-1">
                        {project.description ? (
                          <CardDescription className="line-clamp-2 text-xs">
                            {project.description}
                          </CardDescription>
                        ) : (
                          <CardDescription className="text-xs italic">
                            No description
                          </CardDescription>
                        )}
                        <Badge
                          variant={project.status === 'active' ? 'default' : 'secondary'}
                          className="mt-3 text-[10px] h-5"
                        >
                          {project.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
